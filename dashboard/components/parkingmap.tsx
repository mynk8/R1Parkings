"use client";

import { useState, useEffect } from "react";

interface ParkingSpot {
  sensorId: number;
  tagDetected: boolean;
  plateNumber: string | null;
  timestamp: Date;
}

export default function ParkingGrid() {
  const [spots, setSpots] = useState<ParkingSpot[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch parking spots
  const fetchParkingData = async () => {
    try {
      const response = await fetch("/api/parkings");
      if (!response.ok) throw new Error("Failed to fetch parking data");

      const data = await response.json();
      setSpots(data);
    } catch (err) {
      console.error("Error fetching parking data:", err);
      setError("Failed to fetch parking availability");
    }
  };

  // Poll every 5 seconds
  useEffect(() => {
    fetchParkingData(); // Initial fetch
    const interval = setInterval(fetchParkingData, 1000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  if (error) return <div>{error}</div>;
  if (!spots) return <div>Loading parking availability...</div>;

  const occupiedCount = spots.filter((spot) => spot.tagDetected).length;
  const totalSpots = spots.length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xl font-bold">Parking Availability</h2>
        <div className="text-sm text-gray-600">
          {occupiedCount} of {totalSpots} occupied
        </div>
      </div>
      {/* Grid Container */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          width: "100%",
          height: "400px",
        }}
      >
        {spots.map((spot) => (
          <div
            key={spot.sensorId}
            className={`p-4 rounded-lg border-2 flex flex-col gap-2 ${
              spot.tagDetected
                ? "bg-red-100 border-red-500"
                : "bg-green-100 border-green-500"
            }`}
          >
            <div className="text-lg font-bold">Spot {spot.sensorId}</div>
            {spot.tagDetected ? (
              <>
                <div className="text-sm font-medium">
                  {spot.plateNumber || "No Plate"}
                </div>
                <div className="text-xs text-gray-600">Occupied</div>
              </>
            ) : (
              <div className="text-sm font-medium">Available</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
