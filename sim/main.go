package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/gorilla/websocket"
)

// RfidSensor represents an individual RFID sensor's reading.
type RfidSensor struct {
	SensorID    int    `json:"sensor_id"`
	TagDetected bool   `json:"tag_detected"`
	TagID       string `json:"tag_id,omitempty"`
}

// SensorData is the aggregated payload sent from the ESP32.
type SensorData struct {
	DeviceID    string       `json:"device_id"`
	Timestamp   time.Time    `json:"timestamp"`
	RfidSensors []RfidSensor `json:"rfid_sensors"`
}

// generateSensorData simulates sensor readings from 6 RFID sensors.
func generateSensorData() SensorData {
	// Assume 6 RFID sensors
	numSensors := 6
	sensors := make([]RfidSensor, numSensors)
	for i := 0; i < numSensors; i++ {
		// 30% chance to detect a tag
		detected := rand.Float64() < 0.3
		sensor := RfidSensor{
			SensorID:    i + 1,
			TagDetected: detected,
		}
		if detected {
			sensor.TagID = fmt.Sprintf("RFID-%04d", rand.Intn(9000)+1000)
		}
		sensors[i] = sensor
	}
	return SensorData{
		DeviceID:    "esp32_1",
		Timestamp:   time.Now().UTC(),
		RfidSensors: sensors,
	}
}

func main() {
	// Seed the random number generator.
	rand.Seed(time.Now().UnixNano())

	// Define the ingest endpoint URL (adjust host/port as needed).
	url := "ws://localhost:8080/ws/ingest"
	log.Printf("Connecting to %s...", url)

	// Connect to the /ws/ingest endpoint.
	conn, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		log.Fatalf("Dial error: %v", err)
	}
	defer conn.Close()
	log.Printf("Connected to %s", url)

	// Publish sensor data every second.
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for t := range ticker.C {
		data := generateSensorData()
		// Optionally, update the timestamp to the current tick time.
		data.Timestamp = t.UTC()

		// Convert the sensor data to JSON.
		payload, err := json.Marshal(data)
		if err != nil {
			log.Printf("JSON marshal error: %v", err)
			continue
		}

		// Write the JSON message to the WebSocket.
		if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
			log.Printf("Write message error: %v", err)
			break
		}
		log.Printf("Published sensor data: %s", string(payload))
	}
}
