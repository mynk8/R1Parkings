// app/api/parkings/route.ts
import { NextResponse } from "next/server";
import { getParkingAvailabilityByLot } from "@/app/actions/parkings";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const place = searchParams.get("place");
    if (!place) {
      return NextResponse.json({ error: "Missing place" }, { status: 400 });
    }
    const spots = await getParkingAvailabilityByLot(place);
    return NextResponse.json(spots);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch parking data" },
      { status: 500 },
    );
  }
}
