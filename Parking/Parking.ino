#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

#define RST_PIN         4  // Common RST
#define SDA_1_PIN       5  // SDA 1 pin
#define SDA_2_PIN       17 // SDA 2 pin
#define SDA_3_PIN       16 // SDA 3 pin

#define NR_OF_READERS   3

byte ssPins[] = {SDA_1_PIN, SDA_2_PIN, SDA_3_PIN};

MFRC522 mfrc522[NR_OF_READERS];
MFRC522::MIFARE_Key key;

// Wi-Fi and WebSocket setup
const char* ssid = "Arjun";
const char* password = "9354318837";
WiFiClient wifiClient;
WebSocketsClient webSocket;

WiFiUDP udp;
NTPClient timeClient(udp, "pool.ntp.org", 19800, 60000);

void setup() {
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }

  Serial.begin(115200);
  while (!Serial);

  SPI.begin();

  // Initialize RFID
  for (uint8_t reader = 0; reader < NR_OF_READERS; reader++) {
    mfrc522[reader].PCD_Init(ssPins[reader], RST_PIN);
    Serial.print(F("Reader "));
    Serial.print(reader);
    Serial.print(F(": "));
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");

  }
  Serial.println("WiFi UP");

  // Connect to server (initial attempt)
  webSocket.begin("192.168.1.50", 8000, "/ws/live");

  // Start NTP
  timeClient.begin();
  timeClient.update();
  Serial.println("Time UP");
}

void loop() {
  timeClient.update();
  String timestamp = timeClient.getFormattedTime();  // Get formatted time

  StaticJsonDocument<512> doc;
  doc["device_id"] = "ESP32-001";
  doc["timestamp"] = timestamp;

  JsonArray rfid_sensors = doc.createNestedArray("rfid_sensors");

  for (uint8_t reader = 0; reader < NR_OF_READERS; reader++) {
    JsonObject sensor = rfid_sensors.createNestedObject();
    sensor["sensor_id"] = reader + 1;

    bool tagDetected = false;

    if (mfrc522[reader].PICC_ReadCardSerial()) {
      tagDetected = true;

      sensor["tag_detected"] = true;

      // Read DATA
      String plate_number = "Unknown";
      byte block = 4;
      byte buffer[18];
      byte bufferSize = sizeof(buffer);

      MFRC522::StatusCode status = mfrc522[reader].PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &mfrc522[reader].uid);
      if (status == MFRC522::STATUS_OK) {
        status = mfrc522[reader].MIFARE_Read(block, buffer, &bufferSize);
        if (status == MFRC522::STATUS_OK) {
          plate_number = extract_printable_characters(buffer, bufferSize);
        }
      }
      sensor["plate_number"] = plate_number;
    }
    else {
      // If no card, mark false
      sensor["tag_detected"] = false;
    }

    // Halt card
    mfrc522[reader].PICC_HaltA();
    // Stop encryption
    mfrc522[reader].PCD_StopCrypto1();
  }

  // Only send data if WebSocket is connected
  if (webSocket.isConnected()) {
    String jsonString;
    serializeJson(doc, jsonString);
    webSocket.sendTXT(jsonString);
  }
  else {
    // Attempt to reconnect
    Serial.println("SERVER disconnected, reconnecting...");
    webSocket.begin("192.168.1.50", 8000, "/ws/live");
  }

  delay(1000);
}

String extract_printable_characters(byte* buffer, byte bufferSize) {
  String result = "";
  for (byte i = 0; i < bufferSize; i++) {
    if (buffer[i] >= 32 && buffer[i] <= 126) {
      result += (char)buffer[i];
    }
    else {
      break;
    }
  }
  return result;
}
