// app/api/time/route.ts
import { getTimeParked } from "@/lib/atom";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plate = searchParams.get("plate");

  const timeParked = await getTimeParked("DL01AB1234");
  return NextResponse.json({ timeParked });
}
