import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ContentItemInput {
  icon?: string | null;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  rating?: number | null;
  position?: number;
  active?: boolean;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: ContentItemInput = await req.json();

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  const item = await prisma.contentItem.update({
    where: { id },
    data: {
      icon: body.icon?.trim() || null,
      title: body.title.trim(),
      subtitle: body.subtitle?.trim() || null,
      body: body.body?.trim() || null,
      rating: body.rating ?? null,
      position: body.position,
      active: body.active,
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.contentItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
