import { updateUserPlate } from "@/lib/atom";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { plateNumber } = await request.json();
    const result = await updateUserPlate(plateNumber);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update plate number" },
      { status: 400 },
    );
  }
}
