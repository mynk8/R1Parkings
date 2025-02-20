import React, { Suspense } from "react";

// basic components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// high level components
import { Stats } from "@/components/stats";
import { Overview } from "@/components/overview";
import DummyParkingGrid from "@/components/parktest";

// Skeleton loaders
import { OverviewLoader } from "@/components/overview-loader";
import ParkingGrid from "@/components/parkingmap";
import { WarpBackground } from "@/components/magicui/warp-background";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <WarpBackground>
        <div className="flex-1 container mx-auto p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">R1Parkings</h2>
            </div>

            {/* Stats Section */}
            <div className="w-full">
              <Stats />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
              {/* Map Card */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Map</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-2">
                  <Suspense fallback={<OverviewLoader />}>
                    <Overview />
                  </Suspense>
                </CardContent>
              </Card>

              {/* Parking Spots Card */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Parking Spots</CardTitle>
                  <CardDescription>
                    Real-time parking spot availability
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  <Suspense fallback={<div>Loading parking data...</div>}>
                    <ParkingGrid />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </WarpBackground>
    </main>
  );
}
