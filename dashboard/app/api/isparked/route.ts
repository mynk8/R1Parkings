// app/api/isparked/route.ts
import { NextResponse } from "next/server";
import { getIsCarParked } from "@/app/actions/parkings";
// Note: Adjust the import path if needed

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

    const isParked = await getIsCarParked(plate, place);
    return NextResponse.json({ isParked });
  } catch (error) {
    console.error("Error in isparked endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch parking spot" },
      { status: 500 },
    );
  }
}
