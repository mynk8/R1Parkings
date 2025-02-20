"use client";

import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { useAtom } from "jotai";
import { userPlateAtom, parkingStatusAtom } from "@/lib/atom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Stats() {
  const [userPlate, setUserPlate] = useAtom(userPlateAtom);
  const [parkingStatus, setParkingStatus] = useAtom(parkingStatusAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [tempPlateNumber, setTempPlateNumber] = useState("");

  // Simplified fetch functions
  const fetchIsParked = async () => {
    try {
      const response = await fetch("/api/isparked");
      if (!response.ok) throw new Error("Failed to fetch parking status");
      const data = await response.json();
      return data.isParked;
    } catch (err) {
      console.error("Error fetching parking status:", err);
      return false;
    }
  };

  const fetchTimeParked = async () => {
    try {
      const response = await fetch("/api/time");
      if (!response.ok) throw new Error("Failed to fetch time");
      const data = await response.json();
      return data.timeParked || "0m";
    } catch (err) {
      console.error("Error fetching time:", err);
      return "0m";
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    const updateStatus = async () => {
      try {
        const [isParked, timeParked] = await Promise.all([
          fetchIsParked(),
          fetchTimeParked(),
        ]);

        setParkingStatus((prev) => ({
          ...prev,
          isParked,
          timeParked,
        }));

        setIsLoading(false);
      } catch (error) {
        console.error("Error updating status:", error);
        setIsLoading(false);
      }
    };

    // Initial fetch
    updateStatus();

    // Set up polling
    const interval = setInterval(updateStatus, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [setParkingStatus]);

  const handleSavePlateNumber = async () => {
    try {
      const response = await fetch("/api/update-plate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plateNumber: tempPlateNumber }),
      });

      if (response.ok) {
        setUserPlate(tempPlateNumber);
        setTempPlateNumber("");
      }
    } catch (error) {
      console.error("Failed to update plate number:", error);
    }
  };

  // Loading state with skeleton UI
  if (isLoading) {
    return (
      <div className="flex items-center gap-4 pb-4">
        <div className="flex items-center bg-secondary rounded-full px-4 py-1.5">
          <span className="text-sm text-muted-foreground">
            Loading status...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 pb-4">
      <div className="flex items-center bg-secondary rounded-full px-4 py-1.5">
        {parkingStatus.isParked ? (
          <>
            <span className="text-sm text-muted-foreground mr-2">Status:</span>
            <span className="text-green-600 font-semibold">Parked</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                  <Pencil className="h-4 w-4" />
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
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSavePlateNumber}>Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <span className="text-sm text-muted-foreground mr-2">Status:</span>
            <span className="text-red-600 font-semibold">Not Parked</span>
          </>
        )}
      </div>

      <div className="flex items-center bg-secondary rounded-full px-4 py-1.5">
        <span className="text-sm text-muted-foreground mr-2">Duration:</span>
        <span className="font-semibold">{parkingStatus.timeParked}</span>
      </div>

      {userPlate && (
        <div className="flex items-center bg-secondary rounded-full px-4 py-1.5">
          <span className="text-sm text-muted-foreground mr-2">Plate:</span>
          <span className="font-semibold">{userPlate}</span>
        </div>
      )}
    </div>
  );
}
