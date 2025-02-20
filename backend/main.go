package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/table"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	_ "github.com/lib/pq"
)

// Global variables
var (
	db           *sql.DB
	parkingLotID string
	program      *tea.Program
)

// Data models
type SensorData struct {
	SensorID    int    `json:"sensor_id"`
	TagDetected bool   `json:"tag_detected"`
	PlateNumber string `json:"plate_number"`
}

type MessageData struct {
	DeviceID    string       `json:"device_id"`
	Timestamp   string       `json:"timestamp"`
	RFIDSensors []SensorData `json:"rfid_sensors"`
}

// TUI model and styles remain unchanged
type model struct {
	table         table.Model
	data          []MessageData
	connectionMsg string
	serverStatus  string
}

var (
	baseStyle = lipgloss.NewStyle().
			BorderStyle(lipgloss.NormalBorder()).
			BorderForeground(lipgloss.Color("240"))

	headerStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("87")).
			PaddingLeft(1)

	statusBarStyle = lipgloss.NewStyle().
			Background(lipgloss.Color("62")).
			Foreground(lipgloss.Color("255")).
			Bold(true).
			PaddingLeft(1).
			PaddingRight(1)

	errorStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("196")).
			Bold(true)
)

func initialModel() model {
	columns := []table.Column{
		{Title: "Device ID", Width: 15},
		{Title: "Timestamp", Width: 20},
		{Title: "Sensor ID", Width: 10},
		{Title: "Tag Detected", Width: 12},
		{Title: "Plate Number", Width: 15},
	}

	t := table.New(
		table.WithColumns(columns),
		table.WithFocused(true),
		table.WithHeight(10),
	)
	s := table.DefaultStyles()
	s.Header = s.Header.
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(lipgloss.Color("240")).
		BorderBottom(true).
		Bold(true)
	t.SetStyles(s)

	return model{
		table:         t,
		data:          []MessageData{},
		connectionMsg: "Server starting...",
		serverStatus:  "INITIALIZING",
	}
}

func (m model) Init() tea.Cmd { return nil }

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.String() == "q" || msg.String() == "ctrl+c" {
			return m, tea.Quit
		}
	case MessageData:
		m.data = append(m.data, msg)
		m.updateTableData()
		m.serverStatus = "CONNECTED"
	}
	m.table, cmd = m.table.Update(msg)
	return m, cmd
}

func (m model) View() string {
	var sb strings.Builder
	sb.WriteString(headerStyle.Render("RFID Sensor Monitor"))
	sb.WriteString("\n\n")
	sb.WriteString(baseStyle.Render(m.table.View()))
	sb.WriteString("\n\n")
	status := fmt.Sprintf("Status: %s | Press q to quit", m.serverStatus)
	sb.WriteString(statusBarStyle.Render(status))
	return sb.String()
}

func (m *model) updateTableData() {
	var rows []table.Row
	for _, msg := range m.data {
		for _, sensor := range msg.RFIDSensors {
			plateNum := sensor.PlateNumber
			if !sensor.TagDetected {
				plateNum = "N/A"
			}
			rows = append(rows, table.Row{
				msg.DeviceID,
				msg.Timestamp,
				fmt.Sprintf("%d", sensor.SensorID),
				fmt.Sprintf("%t", sensor.TagDetected),
				plateNum,
			})
		}
	}
	m.table.SetRows(rows)
}

// Updated handleSensorData with response and error aggregation
func handleSensorData(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var data MessageData
	if err := json.Unmarshal(body, &data); err != nil {
		http.Error(w, "Error parsing JSON", http.StatusBadRequest)
		return
	}

	parsedTime, err := time.Parse(time.RFC3339, data.Timestamp)
	if err != nil {
		parsedTime = time.Now()
	}

	var errors []error
	for _, sensor := range data.RFIDSensors {
		// Using the correct column names from the schema
		_, err := db.Exec(`
            INSERT INTO parking_spots (
                device_id,
                "sensorId",
                tag_detected,
                plate_number,
                timestamp,
                "parkingLotId"
            )
            VALUES ($1, $2, $3, $4, $5, $6)
        `,
			data.DeviceID,
			sensor.SensorID,
			sensor.TagDetected,
			sql.NullString{
				String: sensor.PlateNumber,
				Valid:  sensor.TagDetected && sensor.PlateNumber != "",
			},
			parsedTime,
			parkingLotID,
		)
		if err != nil {
			log.Printf("Error inserting sensor data: %v", err)
			errors = append(errors, err)
		}
	}

	if len(errors) > 0 {
		http.Error(w, "Failed to insert some sensor data", http.StatusInternalServerError)
		return
	}

	program.Send(data)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("Data processed successfully"))
}

// Check if parking lot exists
func verifyParkingLotID() error {
	var exists bool
	err := db.QueryRow(`
        SELECT EXISTS (
            SELECT 1
            FROM parking_lots
            WHERE id = $1
        )
    `, parkingLotID).Scan(&exists)

	if err != nil {
		return fmt.Errorf("error checking parking lot existence: %v", err)
	}
	if !exists {
		return fmt.Errorf("parking lot ID %s does not exist in parking_lots table", parkingLotID)
	}
	return nil
}

func main() {
	// Database connection
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Error pinging database: %v", err)
	}

	// Parking lot ID
	parkingLotID = os.Getenv("PARKING_LOT_ID")
	if parkingLotID == "" {
		log.Fatal("PARKING_LOT_ID environment variable is not set")
	}

	// Verify parking lot exists
	if err := verifyParkingLotID(); err != nil {
		log.Fatalf("Parking lot verification failed: %v", err)
	}

	// Initialize TUI
	p := tea.NewProgram(initialModel())
	program = p

	// Start HTTP server
	go func() {
		http.HandleFunc("/ws/ingest", handleSensorData)
		if err := http.ListenAndServe(":8000", nil); err != nil {
			log.Fatalf("ListenAndServe error: %v", err)
		}
	}()

	// Run TUI
	if err := p.Start(); err != nil {
		log.Fatal(err)
	}
}
