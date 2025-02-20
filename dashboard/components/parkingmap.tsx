"use client";

import { indexplaceAtom } from "@/lib/atom";
import { useAtomValue } from "jotai";
import useSWR from "swr";

interface ParkingSpot {
  sensorId: number;
  tagDetected: boolean;
  plateNumber: string | null;
  timestamp: Date;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ParkingGrid() {
  const place = useAtomValue(indexplaceAtom);
  console.log("place", place);
  // Only fetch if a place is available.
  const { data: spots, error } = useSWR<ParkingSpot[]>(
    place ? `/api/parkings?place=${encodeURIComponent(place)}` : null,
    fetcher,
    { refreshInterval: 1000 }, // Auto-refresh every second
  );

  if (error) return <div>Failed to fetch parking availability</div>;
  if (!spots) return <div>Loading parking availability...</div>;

  const occupiedCount = spots.filter((spot) => spot.tagDetected).length;
  const totalSpots = spots.length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xl font-bold">Parking Availability</h2>
        <div className="text-sm text-gray-600">
          {occupiedCount} of {totalSpots} occupied
        </div>
      </div>
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
