import { randomUUID } from "crypto";

// Almacenamiento de imágenes subidas desde el admin. Prioridad:
// 1. Cloudflare R2 (u otro S3-compatible) si está configurado — recomendado,
//    independiente de cualquier suspensión o política de Vercel Blob.
// 2. Vercel Blob, si quedó configurado (compatibilidad con lo anterior).
// 3. Filesystem local (solo development; en Vercel el filesystem es de
//    solo lectura).
//
// Las imágenes de R2 NO se sirven desde su URL pública *.r2.dev — esa URL
// está limitada por Cloudflare ("rate-limited, not recommended for
// production") y por eso algunas fotos dejaban de cargar sin más. En su
// lugar se sirven a través de /api/img/[...key], que las trae por la API
// privada de R2 (sin ese límite) y las cachea de forma permanente.

export function hasR2() {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

export function hasVercelBlob() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function r2Client() {
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadToR2(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await r2Client();

  const key = `uploads/${filename}`;
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `/api/img/${key}`;
}

export async function downloadFromR2(
  key: string
): Promise<{ body: Buffer; contentType: string }> {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await r2Client();

  const res = await client.send(
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key })
  );
  if (!res.Body) throw new Error("R2 no devolvió contenido para esta clave");

  // transformToByteArray funciona igual en cualquier runtime de Node,
  // a diferencia de transformToWebStream que puede fallar según el
  // entorno — mejor para un proxy que debe funcionar siempre.
  const bytes = await (res.Body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray();
  return { body: Buffer.from(bytes), contentType: res.ContentType ?? "application/octet-stream" };
}

export function randomFilename(contentType: string) {
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  return `${randomUUID()}.${ext}`;
}
