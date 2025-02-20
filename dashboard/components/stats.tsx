"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Pencil } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { userPlateAtom, indexplaceAtom } from "@/lib/atom";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const mapData = [
  {
    place: "dlf-mall",
    url: "https://www.google.com/maps/embed/v1/search?q=DLF+Mall+of+India,+Sector+18,+Noida,+Uttar+Pradesh,+India&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8",
    rate: "$5/hr",
  },
  {
    place: "ambience-mall",
    url: "https://www.google.com/maps/embed/v1/place?q=Ambience+Mall,+Vasant+Kunj:+2,+Nelson+Mandela+Marg,+Ambience+Island,+Vasant+Kunj+II,+Vasant+Kunj,+New+Delhi,+Delhi+110070,+India&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8",
    rate: "$8/hr",
  },
  // ... more map data objects
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Stats() {
  const [userPlate, setUserPlate] = useAtom(userPlateAtom);
  const place = useAtomValue(indexplaceAtom);
  const [tempPlateNumber, setTempPlateNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // SWR call for parking status.
  const { data: isParkedData, error: isParkedError } = useSWR(
    userPlate && place
      ? `/api/isparked?plate=${encodeURIComponent(
          userPlate,
        )}&place=${encodeURIComponent(place)}`
      : null,
    fetcher,
    { refreshInterval: 1000 },
  );

  // SWR call for parked duration.
  const { data: timeData, error: timeError } = useSWR(
    userPlate && place
      ? `/api/time?plate=${encodeURIComponent(
          userPlate,
        )}&place=${encodeURIComponent(place)}`
      : null,
    fetcher,
    { refreshInterval: 1000 },
  );

  const handleSavePlateNumber = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/update-plate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plateNumber: tempPlateNumber }),
      });
      if (response.ok) {
        setUserPlate(tempPlateNumber);
        setTempPlateNumber("");
      }
    } catch (error) {
      console.error("Failed to update plate number:", error);
    }
    setIsSaving(false);
  };

  if (!userPlate || !place) {
    return <div>Please set your plate and select a parking lot.</div>;
  }

  if (isParkedError || timeError)
    return <div>Error loading parking status.</div>;
  if (!isParkedData || !timeData) return <div>Loading parking status...</div>;

  const isParked = isParkedData.isParked;
  const timeParked = timeData.timeParked;

  return (
    <div className="flex items-center gap-4 pb-4">
      {/* Status Pill */}
      <div className="flex items-center bg-secondary rounded-full px-4 py-1.5 shadow-lg">
        <span className="text-sm text-muted-foreground mr-2">Status:</span>
        <span
          className={`font-semibold transition-colors duration-300 ${
            isParked
              ? "text-green-600 animate-pulse"
              : "text-red-600 animate-pulse"
          }`}
        >
          {isParked ? "Parked" : "Not Parked"}
        </span>
        {isParked && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                <Pencil className="h-4 w-4 text-current" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Plate Number</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Input
                    id="plateNumber"
                    placeholder="Enter plate number"
                    value={tempPlateNumber}
                    onChange={(e) => setTempPlateNumber(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setTempPlateNumber("")}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSavePlateNumber} disabled={isSaving}>
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Duration Pill */}
      <div className="flex items-center bg-secondary rounded-full px-4 py-1.5 shadow-lg">
        <span className="text-sm text-muted-foreground mr-2">Duration:</span>
        <span className="font-semibold transition-colors duration-300">
          {timeParked}
        </span>
      </div>

      {/* Plate Pill */}
      <div className="flex items-center bg-secondary rounded-full px-4 py-1.5 shadow-lg">
        <span className="text-sm text-muted-foreground mr-2">Plate:</span>
        <span className="font-semibold transition-colors duration-300">
          {userPlate}
        </span>
      </div>

      {/* Rate Pill */}
      <div className="flex items-center bg-secondary rounded-full px-4 py-1.5 shadow-lg">
        <span className="text-sm text-muted-foreground mr-2">Rate:</span>
        <span className="font-semibold transition-colors duration-300">
          {mapData.find((item) => item.place === place)?.rate || "$0/hr"}
        </span>
      </div>
    </div>
  );
}
