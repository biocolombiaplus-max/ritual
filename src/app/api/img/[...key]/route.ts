import { NextRequest, NextResponse } from "next/server";
import { downloadFromR2 } from "@/lib/storage";

// Sirve las imágenes guardadas en R2 a través de nuestro propio dominio en
// vez de la URL pública *.r2.dev (limitada por Cloudflare para producción).
// El Key del objeto (ej. "uploads/abc123.jpg") viene directo de la URL.

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key: keyParts } = await params;
  const key = keyParts.join("/");

  const file = await downloadFromR2(key);
  if (!file || !file.body) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return new NextResponse(file.body, {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
