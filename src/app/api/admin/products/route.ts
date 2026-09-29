import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueProductSlug } from "@/lib/slug";
import { resolveCategoryId } from "@/lib/category";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  const products = await prisma.product.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] }
      : undefined,
    include: { images: { orderBy: { position: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

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
  // Alternativa a categoryId: nombre libre de categoría. Si ambos vienen,
  // categoryName gana — se busca o se crea la categoría por su nombre (útil
  // para la carga rápida, donde el admin solo escribe el nombre).
  categoryName?: string | null;
  featured?: boolean;
  active?: boolean;
  images: string[];
}

export async function POST(req: NextRequest) {
  const body: ProductInput = await req.json();

  if (!body.name || !body.description || body.price === undefined) {
    return NextResponse.json({ error: "Nombre, descripción y precio son obligatorios" }, { status: 400 });
  }

  const slug = await uniqueProductSlug(body.name);
  const categoryId = body.categoryName
    ? await resolveCategoryId(body.categoryName)
    : body.categoryId || null;

  const product = await prisma.product.create({
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
      categoryId,
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
