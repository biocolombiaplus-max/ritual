import { NextRequest, NextResponse } from "next/server";
import { getFunnelStats } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const days = Number(new URL(req.url).searchParams.get("days") ?? 30);
  const stats = await getFunnelStats([7, 30, 90].includes(days) ? days : 30);
  return NextResponse.json(stats);
}
