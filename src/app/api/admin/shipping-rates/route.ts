import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rates = await prisma.shippingRate.findMany({
    orderBy: [{ department: "asc" }, { city: "asc" }],
  });
  return NextResponse.json({ rates });
}

interface ShippingRateInput {
  department: string;
  city?: string;
  cost: number;
  etaLabel?: string;
  active?: boolean;
}

export async function POST(req: NextRequest) {
  const body: ShippingRateInput = await req.json();

  if (!body.department || body.cost === undefined || body.cost === null || Number(body.cost) < 0) {
    return NextResponse.json({ error: "Departamento y costo son obligatorios" }, { status: 400 });
  }

  const rate = await prisma.shippingRate.upsert({
    where: { department_city: { department: body.department, city: body.city ?? "" } },
    update: {
      cost: Math.round(body.cost),
      etaLabel: body.etaLabel?.trim() || null,
      active: body.active ?? true,
    },
    create: {
      department: body.department,
      city: body.city ?? "",
      cost: Math.round(body.cost),
      etaLabel: body.etaLabel?.trim() || null,
      active: body.active ?? true,
    },
  });

  return NextResponse.json({ rate });
}
