import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GROUPS = ["benefit", "process", "testimonial", "education"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group");

  const items = await prisma.contentItem.findMany({
    where: group ? { group } : undefined,
    orderBy: [{ group: "asc" }, { position: "asc" }],
  });

  return NextResponse.json({ items });
}

interface ContentItemInput {
  group: string;
  icon?: string | null;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  rating?: number | null;
  active?: boolean;
}

export async function POST(req: NextRequest) {
  const body: ContentItemInput = await req.json();

  if (!body.group || !GROUPS.includes(body.group) || !body.title?.trim()) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const count = await prisma.contentItem.count({ where: { group: body.group } });

  const item = await prisma.contentItem.create({
    data: {
      group: body.group,
      icon: body.icon?.trim() || null,
      title: body.title.trim(),
      subtitle: body.subtitle?.trim() || null,
      body: body.body?.trim() || null,
      rating: body.rating ?? null,
      position: count,
      active: body.active ?? true,
    },
  });

  return NextResponse.json({ item });
}
