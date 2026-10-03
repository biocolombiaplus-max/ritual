import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { hasR2, hasVercelBlob, randomFilename, uploadToR2 } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no soportado. Usa JPG, PNG, WEBP, GIF o AVIF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "La imagen supera el tamaño máximo de 8MB" }, { status: 400 });
    }

    const filename = randomFilename(file.type);

    // En Vercel (y cualquier hosting serverless) el sistema de archivos es
    // de solo lectura, así que la imagen tiene que ir a almacenamiento
    // externo. Prioridad: Cloudflare R2 (independiente de Vercel) y, si no
    // está configurado, Vercel Blob. En desarrollo local sin ninguno de los
    // dos, se guarda en /public/uploads.
    if (hasR2()) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadToR2(buffer, filename, file.type);
        return NextResponse.json({ url });
      } catch (error) {
        console.error("upload: R2 error", error);
        return NextResponse.json(
          { error: "No se pudo subir la imagen a R2. Revisa las credenciales R2_* en las variables de entorno." },
          { status: 502 }
        );
      }
    }

    if (hasVercelBlob()) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(`uploads/${filename}`, file, {
          access: "public",
          addRandomSuffix: false,
        });
        return NextResponse.json({ url: blob.url });
      } catch (error) {
        console.error("upload: Vercel Blob error", error);
        return NextResponse.json(
          {
            error:
              error instanceof Error && /suspend/i.test(error.message)
                ? "El almacenamiento de Vercel Blob está suspendido. Configura R2_* para usar Cloudflare R2 en su lugar."
                : "No se pudo subir la imagen a Vercel Blob.",
          },
          { status: 502 }
        );
      }
    }

    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Falta configurar el almacenamiento de imágenes en producción: agrega las variables R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME y R2_PUBLIC_URL (recomendado) o conecta un Blob Store de Vercel.",
        },
        { status: 500 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("upload:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo subir la imagen" },
      { status: 500 }
    );
  }
}
