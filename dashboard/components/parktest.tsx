import React from "react";
import { Card } from "@/components/ui/card";

// Dummy data with a realistic parking lot scenario
const dummySpots = [
  {
    sensorId: "A1",
    tagDetected: true,
    plateNumber: "ABC123",
    timestamp: new Date(),
  },
  {
    sensorId: "A2",
    tagDetected: false,
    plateNumber: null,
    timestamp: new Date(),
  },
  {
    sensorId: "A3",
    tagDetected: true,
    plateNumber: "XYZ789",
    timestamp: new Date(),
  },
  {
    sensorId: "B1",
    tagDetected: false,
    plateNumber: null,
    timestamp: new Date(),
  },
  {
    sensorId: "B2",
    tagDetected: true,
    plateNumber: "DEF456",
    timestamp: new Date(),
  },
  {
    sensorId: "B3",
    tagDetected: false,
    plateNumber: null,
    timestamp: new Date(),
  },
  {
    sensorId: "C1",
    tagDetected: true,
    plateNumber: null,
    timestamp: new Date(),
  },
  {
    sensorId: "C2",
    tagDetected: false,
    plateNumber: null,
    timestamp: new Date(),
  },
  {
    sensorId: "C3",
    tagDetected: true,
    plateNumber: "GHI789",
    timestamp: new Date(),
  },
];

export default function DummyParkingGrid() {
  const occupiedCount = dummySpots.filter((spot) => spot.tagDetected).length;
  const totalSpots = dummySpots.length;
  const availableSpots = totalSpots - occupiedCount;

  return (
    <div className="space-y-4">
      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="p-3">
          <div className="text-sm font-medium text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{totalSpots}</div>
        </Card>
        <Card className="p-3">
          <div className="text-sm font-medium text-muted-foreground">
            Available
          </div>
          <div className="text-2xl font-bold text-green-600">
            {availableSpots}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-sm font-medium text-muted-foreground">
            Occupied
          </div>
          <div className="text-2xl font-bold text-red-600">{occupiedCount}</div>
        </Card>
      </div>

      {/* Parking Grid */}
      <div className="grid grid-cols-3 gap-3">
        {dummySpots.map((spot) => (
          <div
            key={spot.sensorId}
            className={`
              p-3 rounded-lg border
              ${
                spot.tagDetected
                  ? "border-red-200 bg-red-50 dark:bg-red-900/20"
                  : "border-green-200 bg-green-50 dark:bg-green-900/20"
              }
              transition-colors duration-200
            `}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{spot.sensorId}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  spot.tagDetected
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                }`}
              >
                {spot.tagDetected ? "Occupied" : "Free"}
              </span>
            </div>
            {spot.tagDetected && spot.plateNumber && (
              <div className="text-sm text-muted-foreground">
                {spot.plateNumber}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
