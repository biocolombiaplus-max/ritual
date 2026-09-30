import { NextRequest, NextResponse } from "next/server";
import { computeShipping } from "@/lib/shipping";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const department = searchParams.get("department");
  const city = searchParams.get("city");
  const subtotal = Number(searchParams.get("subtotal") ?? 0);

  if (!department || !city) {
    return NextResponse.json({ error: "Falta el departamento o la ciudad" }, { status: 400 });
  }

  const quote = await computeShipping(department, city, Number.isFinite(subtotal) ? subtotal : 0);
  return NextResponse.json(quote);
}
