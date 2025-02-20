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

export async function getIsCarParked(plate: string) {
  try {
    const spot = await prisma.parkingSpot.findFirst({
      where: { plateNumber: plate, parkingLotId: "dlf-mall" },
    });

    return spot !== null;
  } catch (error) {
    console.error("Error fetching parking spot:", error);
    throw new Error("Failed to fetch parking spot");
  }
}

export async function getTimeCarParked(plate: string) {
  try {
    const place = useAtomValue(indexplaceAtom);
    const spot = await prisma.parkingSpot.findFirst({
      where: { plateNumber: plate, parkingLotId: place },
      orderBy: { timestamp: "desc" },
    });

    if (!spot) {
      return "N/A";
    }

    const timeParked = new Date().getTime() - spot.timestamp.getTime();
    return `${Math.floor(timeParked / 1000)} seconds`;
  } catch (error) {
    console.error("Error fetching parking spot:", error);
    throw new Error("Failed to fetch parking spot");
  }
}
