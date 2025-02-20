import { NextResponse } from "next/server";
import { getParkingAvailabilityByLot } from "@/app/actions/parkings";

export async function GET() {
  try {
    const spots = await getParkingAvailabilityByLot("DLFMALL");
    return NextResponse.json(spots);
  } catch (error) {
    console.error("Error fetching parking spots:", error);
    return NextResponse.json(
      { error: "Failed to fetch parking data" },
      { status: 500 },
    );
  }
}
