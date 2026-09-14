import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const baseSlug = slugify(name, { lower: true, strict: true, locale: "es" });
  let slug = baseSlug;
  let i = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const count = await prisma.category.count();
  const category = await prisma.category.create({
    data: { name: name.trim(), slug, position: count },
  });

  return NextResponse.json({ category });
}
