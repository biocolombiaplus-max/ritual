import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get("featured");
  const category = searchParams.get("category");
  const excludeId = searchParams.get("excludeId");
  const search = searchParams.get("q");
  const limit = Number(searchParams.get("limit") ?? 24);

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(featured ? { featured: true } : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(excludeId ? { id: { not: excludeId } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 60),
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      shortDescription: p.shortDescription,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      featured: p.featured,
      stock: p.stock,
      category: p.category?.name ?? null,
      image: p.images[0]?.url ?? null,
    })),
  });
}
