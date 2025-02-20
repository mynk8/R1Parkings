// app/api/time/route.ts
import { NextResponse } from "next/server";
import { getTimeCarParked } from "@/app/actions/parkings"; // adjust the import as needed

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plate = searchParams.get("plate");
    const place = searchParams.get("place");

    if (!plate || !place) {
      return NextResponse.json(
        { error: "Missing plate or place" },
        { status: 400 },
      );
    }

    const timeParked = await getTimeCarParked(plate, place);
    return NextResponse.json({ timeParked });
  } catch (error) {
    console.error("Error in time endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch time parked" },
      { status: 500 },
    );
  }
}
