import { prisma } from "@/lib/prisma";
import type { ParkingSpot } from "@prisma/client";

export async function getAvailableSpots(): Promise<ParkingSpot[]> {
  return prisma.parkingSpot.findMany({
    where: {
      tagDetected: false,
    },
    orderBy: {
      timestamp: "desc",
    },
    distinct: ["sensorId"],
  });
}

export async function getOccupiedSpots(): Promise<ParkingSpot[]> {
  return prisma.parkingSpot.findMany({
    where: {
      tagDetected: true,
    },
    orderBy: {
      timestamp: "desc",
    },
    distinct: ["sensorId"],
  });
}

export async function getParkingStatus() {
  const latestStatuses = await prisma.parkingSpot.findMany({
    orderBy: {
      timestamp: "desc",
    },
    distinct: ["sensorId"],
    select: {
      sensorId: true,
      deviceId: true,
      tagDetected: true,
      plateNumber: true,
      timestamp: true,
    },
  });

  return {
    available: latestStatuses.filter((spot) => !spot.tagDetected),
    occupied: latestStatuses.filter((spot) => spot.tagDetected),
    totalSpots: latestStatuses.length,
    availableCount: latestStatuses.filter((spot) => !spot.tagDetected).length,
    occupiedCount: latestStatuses.filter((spot) => spot.tagDetected).length,
  };
}

export async function getIsParked(plateNumber: string): Promise<boolean> {
  const spot = await prisma.parkingSpot.findFirst({
    where: {
      plateNumber: plateNumber,
      tagDetected: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  return !!spot;
}

export async function getTimeParked(plateNumber: string): Promise<string> {
  const spot = await prisma.parkingSpot.findFirst({
    where: {
      plateNumber: plateNumber,
      tagDetected: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  if (!spot) return "Not parked";

  const parkingTime = new Date(spot.timestamp);
  const now = new Date();
  const diffMs = now.getTime() - parkingTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  return `${hours}h ${mins}m`;
}

export async function updateUserPlate(plateNumber: string) {
  // You might want to store this in a users table or localStorage
  // For now, we'll just validate if the plate exists
  const spot = await prisma.parkingSpot.findFirst({
    where: {
      plateNumber: plateNumber,
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  if (!spot) {
    throw new Error("Plate number not found in system");
  }

  return spot;
}
