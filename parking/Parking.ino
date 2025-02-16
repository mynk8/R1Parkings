#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <ArduinoJson.h>
#include <MFRC522.h>
#include <SPI.h>
#include <time.h>


const char* ssid = "SSID";
const char* password = "PWD";

const char* serverHost = "http://192.168.1.50:5000/ws/ingest";


#define SS_1  5  // RFID 1
#define SS_2  17 // RFID 2
#define SS_3  16 // RFID 3
#define RST_PIN 4 // Common Reset


MFRC522 rfid1(SS_1, RST_PIN);
MFRC522 rfid2(SS_2, RST_PIN);
MFRC522 rfid3(SS_3, RST_PIN);


WiFiClient client;
HTTPClient http;


struct RfidSensor {
  int sensorID;
  bool tagDetected;
  String tagID;
};


void initRFID(MFRC522 &rfid, int ss_pin) {
  pinMode(ss_pin, OUTPUT);
  digitalWrite(ss_pin, HIGH);
  delay(100);
  rfid.PCD_Init();
  Serial.print("RC522 Initialized on SS: ");
  Serial.println(ss_pin);
}


void deselectAllRFID() {
    digitalWrite(SS_1, HIGH);
    digitalWrite(SS_2, HIGH);
    digitalWrite(SS_3, HIGH);
}


String readRFID(MFRC522 &rfid, int ss_pin) {
  deselectAllRFID();
  digitalWrite(ss_pin, LOW);
  delay(50);

  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    digitalWrite(ss_pin, HIGH);
    return "";
  }

  String tagID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    tagID += String(rfid.uid.uidByte[i], HEX);
  }

  tagID.toUpperCase();
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  digitalWrite(ss_pin, HIGH);
  return tagID;
}



String getTimestamp() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Time FAIL");
    return "";
  }
  char buffer[25];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}



void sendSensorData() {
  if (WiFi.status() == WL_CONNECTED) {
    http.begin(serverHost);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<512> doc;
    doc["device_id"] = "ESP32-001";
    doc["timestamp"] = getTimestamp();

    JsonArray sensorsArray = doc.createNestedArray("rfid_sensors");

    RfidSensor sensors[3] = {
      {1, false, ""},
      {2, false, ""},
      {3, false, ""}
    };

    sensors[0].tagID = readRFID(rfid1, SS_1);
    sensors[1].tagID = readRFID(rfid2, SS_2);
    sensors[2].tagID = readRFID(rfid3, SS_3);

    for (int i = 0; i < 3; i++) {
      if (sensors[i].tagID != "") {
        sensors[i].tagDetected = true;
      }

      JsonObject sensorObj = sensorsArray.createNestedObject();
      sensorObj["sensor_id"] = sensors[i].sensorID;
      sensorObj["tag_detected"] = sensors[i].tagDetected;
      if (sensors[i].tagDetected) {
        sensorObj["tag_id"] = sensors[i].tagID;
      }
    }

    String jsonString;
    serializeJson(doc, jsonString);
    Serial.println("Sending JSON Data:");
    Serial.println(jsonString);

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
      Serial.println("Response: " + http.getString());
    } else {
      Serial.println("Error sending request: " + String(httpResponseCode));
    }

    http.end();
  } else {
    Serial.println("WiFi DOWN");
  }
}



void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }
  Serial.println("\nWiFi UP");

  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  delay(2000);
  Serial.println("Time UP");

  SPI.begin();
  initRFID(rfid1, SS_1);
  initRFID(rfid2, SS_2);
  initRFID(rfid3, SS_3);

  Serial.println("System UP");
}



void loop() {
  sendSensorData();
  delay(500);
  Serial.println("Data PUSHED");
}
