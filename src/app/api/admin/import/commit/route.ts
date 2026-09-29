import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueProductSlug } from "@/lib/slug";
import { resolveCategoryId } from "@/lib/category";
import type { ImportRow } from "@/lib/import";

export async function POST(req: NextRequest) {
  const { rows } = (await req.json()) as { rows: ImportRow[] };

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No hay productos para importar" }, { status: 400 });
  }

  let created = 0;
  const errors: string[] = [];

  for (const row of rows) {
    if (!row.name || !row.price) {
      errors.push(`Omitido: "${row.name || "(sin nombre)"}" — falta nombre o precio`);
      continue;
    }

    const categoryId = await resolveCategoryId(row.category);
    const slug = await uniqueProductSlug(row.name);

    await prisma.product.create({
      data: {
        slug,
        name: row.name.trim(),
        shortDescription: row.shortDescription?.trim() || null,
        description: row.description?.trim() || row.shortDescription?.trim() || row.name.trim(),
        price: Math.round(row.price),
        compareAtPrice: row.compareAtPrice ? Math.round(row.compareAtPrice) : null,
        sku: row.sku?.trim() || null,
        stock: row.stock ?? 10,
        categoryId,
        featured: !!row.featured,
        active: true,
        images: row.imageUrl
          ? { create: [{ url: row.imageUrl.trim(), position: 0 }] }
          : undefined,
      },
    });
    created++;
  }

  return NextResponse.json({ created, errors });
}
