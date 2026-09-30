import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const rate = await prisma.shippingRate.update({
    where: { id },
    data: {
      cost: body.cost !== undefined ? Math.round(body.cost) : undefined,
      etaLabel: body.etaLabel !== undefined ? body.etaLabel?.trim() || null : undefined,
      active: body.active,
    },
  });

  return NextResponse.json({ rate });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.shippingRate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
