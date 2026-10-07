import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasR2, randomFilename, uploadToR2 } from "@/lib/storage";

// Recupera automáticamente las fotos que quedaron en el Blob Store de
// Vercel suspendido: intenta descargar cada una desde su URL vieja y, si
// todavía responde, la sube a R2 y actualiza la base de datos — sin que el
// admin tenga que volver a subir manualmente las que sí se puedan rescatar.
// Se procesa en lotes para no exceder el tiempo máximo de la función; si
// quedan pendientes, el admin vuelve a ejecutar hasta terminar.

export const runtime = "nodejs";
export const maxDuration = 60;

const OLD_DOMAIN = "public.blob.vercel-storage.com";
const BATCH_SIZE = 15;

export async function POST() {
  if (!hasR2()) {
    return NextResponse.json(
      { error: "Configura primero las variables R2_* para poder migrar las imágenes." },
      { status: 400 }
    );
  }

  const broken = await prisma.productImage.findMany({
    where: { url: { contains: OLD_DOMAIN } },
    take: BATCH_SIZE,
    include: { product: { select: { name: true } } },
  });

  const migrated: { productName: string; oldUrl: string; newUrl: string }[] = [];
  const failed: { productName: string; oldUrl: string; reason: string }[] = [];

  for (const image of broken) {
    try {
      const res = await fetch(image.url);
      if (!res.ok) {
        failed.push({ productName: image.product.name, oldUrl: image.url, reason: `HTTP ${res.status}` });
        continue;
      }
      const contentType = res.headers.get("content-type") || "image/jpeg";
      const buffer = Buffer.from(await res.arrayBuffer());
      const filename = randomFilename(contentType);
      const newUrl = await uploadToR2(buffer, filename, contentType);

      await prisma.productImage.update({ where: { id: image.id }, data: { url: newUrl } });
      migrated.push({ productName: image.product.name, oldUrl: image.url, newUrl });
    } catch (error) {
      failed.push({
        productName: image.product.name,
        oldUrl: image.url,
        reason: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  const remaining = await prisma.productImage.count({ where: { url: { contains: OLD_DOMAIN } } });

  return NextResponse.json({ migrated, failed, remaining });
}
