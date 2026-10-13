import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Reescribe las URLs de imágenes que quedaron apuntando directo al dominio
// público *.r2.dev (limitado por Cloudflare, por eso a veces no cargaban)
// para que pasen por /api/img en su lugar — mismo archivo en R2, solo
// cambia por dónde se sirve. Es un simple reemplazo de texto, no hay que
// volver a subir nada.

export async function POST() {
  const oldPrefix = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!oldPrefix) {
    return NextResponse.json({ error: "R2_PUBLIC_URL no está configurada" }, { status: 400 });
  }

  const [products, sections] = await Promise.all([
    prisma.$executeRaw`
      UPDATE "ProductImage"
      SET url = '/api/img' || substring(url from length(${oldPrefix}) + 1)
      WHERE url LIKE ${oldPrefix + "/%"}
    `,
    prisma.$executeRaw`
      UPDATE "SiteSection"
      SET "imageUrl" = '/api/img' || substring("imageUrl" from length(${oldPrefix}) + 1)
      WHERE "imageUrl" LIKE ${oldPrefix + "/%"}
    `,
  ]);

  return NextResponse.json({ updatedProductImages: products, updatedSections: sections });
}
