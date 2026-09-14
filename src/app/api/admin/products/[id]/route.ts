import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueProductSlug } from "@/lib/slug";

interface ProductInput {
  name: string;
  shortDescription?: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string;
  stock: number;
  weightGrams?: number;
  categoryId?: string | null;
  featured?: boolean;
  active?: boolean;
  images: string[];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: ProductInput = await req.json();

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const slug =
    body.name && body.name.trim() !== existing.name
      ? await uniqueProductSlug(body.name, id)
      : existing.slug;

  await prisma.productImage.deleteMany({ where: { productId: id } });

  const product = await prisma.product.update({
    where: { id },
    data: {
      slug,
      name: body.name.trim(),
      shortDescription: body.shortDescription?.trim() || null,
      description: body.description.trim(),
      price: Math.round(body.price),
      compareAtPrice: body.compareAtPrice ? Math.round(body.compareAtPrice) : null,
      sku: body.sku?.trim() || null,
      stock: body.stock ?? 0,
      weightGrams: body.weightGrams ?? 300,
      categoryId: body.categoryId || null,
      featured: !!body.featured,
      active: body.active ?? true,
      images: {
        create: (body.images ?? []).map((url, i) => ({ url, position: i })),
      },
    },
    include: { images: true, category: true },
  });

  return NextResponse.json({ product });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
