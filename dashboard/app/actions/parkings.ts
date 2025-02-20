import { indexplaceAtom } from "@/lib/atom";
import { prisma } from "@/lib/prisma";
import { useAtomValue } from "jotai";

export async function getParkingAvailabilityByLot(place: string) {
  try {
    const spots = await prisma.parkingSpot.findMany({
      where: { parkingLotId: place },
      orderBy: { timestamp: "desc" }, // Get latest timestamps first
      select: {
        sensorId: true,
        tagDetected: true,
        plateNumber: true,
        timestamp: true,
      },
    });

    // Filter to keep only the latest entry for each sensorId
    const latestSpots = spots.reduce((acc, spot) => {
      if (!acc.has(spot.sensorId)) {
        acc.set(spot.sensorId, spot);
      }
      return acc;
    }, new Map());

    return Array.from(latestSpots.values());
  } catch (error) {
    console.error("Error fetching parking spots:", error);
    throw new Error("Failed to fetch parking availability");
  }
}

export async function getIsCarParked(plate: string, place: string) {
  try {
    const spot = await prisma.parkingSpot.findFirst({
      where: { plateNumber: plate, parkingLotId: place },
    });

    return spot !== null;
  } catch (error) {
    console.error("Error fetching parking spot:", error);
    throw new Error("Failed to fetch parking spot");
  }
}

export async function getTimeCarParked(plate: string, place: string) {
  try {
    const spot = await prisma.parkingSpot.findFirst({
      where: { plateNumber: plate, parkingLotId: place },
      orderBy: { timestamp: "desc" },
    });

    if (!spot) {
      return "N/A";
    }

    // The stored timestamp is in IST (UTC+5:30) but is marked with a Z,
    // so adjust by subtracting the offset (5.5 hours in ms) to get the correct UTC time.
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const correctedStartTime = spot.timestamp.getTime() - IST_OFFSET_MS;
    const diffMs = Date.now() - correctedStartTime;

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = "";
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (minutes > 0 || hours > 0) {
      result += `${minutes}m `;
    }
    result += `${seconds}s`;

    return result.trim();
  } catch (error) {
    console.error("Error fetching parking spot:", error);
    throw new Error("Failed to fetch parking spot");
  }
}
