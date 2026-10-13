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

  try {
    const file = await downloadFromR2(key);
    return new NextResponse(new Uint8Array(file.body), {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("img proxy error for key:", key, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo traer la imagen de R2",
        key,
      },
      { status: 404 }
    );
  }
}
