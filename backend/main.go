package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v4/pgxpool"
)

type RfidSensor struct {
	SensorID    int    `json:"sensor_id"`
	TagDetected bool   `json:"tag_detected"`
	NumberPlateID       string `json:"name_plate_id,omitempty"`
}

type SensorData struct {
	DeviceID    string       `json:"device_id"`
	Timestamp   time.Time    `json:"timestamp"`
	RfidSensors []RfidSensor `json:"rfid_sensors"`
}

// Websocket broadcast hub for live clients
type Hub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan SensorData
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mu         sync.Mutex
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan SensorData),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (h *Hub) run() {
	for {
		select {
		case conn := <-h.register:
			h.mu.Lock()
			h.clients[conn] = true
			h.mu.Unlock()
			log.Println("Live client connected to the service")
		case conn := <-h.unregister:
			h.mu.Lock()
			delete(h.clients, conn)
			h.mu.Unlock()
			log.Println("Live client disconnected")
		case data := <-h.broadcast:
			h.mu.Lock()
			for client := range h.clients {
				if err := client.WriteJSON(data); err != nil {
					log.Printf("Error writing to live client: %v", err)
					client.Close()
					delete(h.clients, client)
				}
			}
			h.mu.Unlock()
		}
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// sensorIngestHandler now accepts HTTP POST with JSON payload from the ESP32.
func sensorIngestHandler(dbPool *pgxpool.Pool, hub *Hub, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var data SensorData
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Bad Request: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Insert the sensor data into TimescaleDB.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := insertSensorData(ctx, dbPool, data); err != nil {
		log.Printf("DB insertion error: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	log.Printf("Stored sensor data from device %s at %s", data.DeviceID, data.Timestamp.Format(time.RFC3339))

	// Broadcast the sensor data to all connected live clients.
	hub.broadcast <- data

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Data ingested successfully"))
}

// liveDataHandler remains a websocket endpoint for live updates.
func liveDataHandler(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Live WS upgrade error: %v", err)
		return
	}
	hub.register <- conn

	// Keep the connection open until an error occurs.
	for {
		if _, _, err := conn.NextReader(); err != nil {
			hub.unregister <- conn
			break
		}
	}
}

func insertSensorData(ctx context.Context, dbPool *pgxpool.Pool, data SensorData) error {
	query := `
		INSERT INTO rfid_sensor_data (device_id, sensor_id, tag_detected, tag_id, timestamp)
		VALUES ($1, $2, $3, $4, $5);
	`
	for _, sensor := range data.RfidSensors {
		if _, err := dbPool.Exec(ctx, query, data.DeviceID, sensor.SensorID, sensor.TagDetected, sensor.TagID, data.Timestamp); err != nil {
			return err
		}
	}
	return nil
}

func main() {
	// 1. Connect to TimescaleDB.
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Replace with your actual connection string.
		dbURL = "postgres://postgres:password@localhost:5431/postgres?sslmode=disable"
	}
	dbPool, err := pgxpool.Connect(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to TimescaleDB: %v", err)
	}
	defer dbPool.Close()
	log.Println("Connected to TimescaleDB.")

	// 2. Create and start the WebSocket broadcast hub.
	hub := newHub()
	go hub.run()

	// 3. Set up HTTP endpoints.
	// Endpoint for sensor ingestion (HTTP POST from ESP32).
	http.HandleFunc("/ws/ingest", func(w http.ResponseWriter, r *http.Request) {
		sensorIngestHandler(dbPool, hub, w, r)
	})

	// Endpoint for frontend live updates (WebSocket).
	http.HandleFunc("/ws/live", func(w http.ResponseWriter, r *http.Request) {
		liveDataHandler(hub, w, r)
	})

	// Simple health check / info endpoint.
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Backend server running. Connect to /ws/ingest for sensor data and /ws/live for live updates."))
	})

	// 4. Start HTTP server.
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("HTTP server listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
