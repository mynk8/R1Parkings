import { getIsParked } from "@/lib/atom";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plate = searchParams.get("plate");

  const isParked = await getIsParked("DL01AB1234");
  return NextResponse.json({ isParked });
}
