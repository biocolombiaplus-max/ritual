import { randomUUID } from "crypto";

// Almacenamiento de imágenes subidas desde el admin. Prioridad:
// 1. Cloudflare R2 (u otro S3-compatible) si está configurado — recomendado,
//    independiente de cualquier suspensión o política de Vercel Blob.
// 2. Vercel Blob, si quedó configurado (compatibilidad con lo anterior).
// 3. Filesystem local (solo development; en Vercel el filesystem es de
//    solo lectura).

export function hasR2() {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
  );
}

export function hasVercelBlob() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function uploadToR2(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const key = `uploads/${filename}`;
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return `${base}/${key}`;
}

export function randomFilename(contentType: string) {
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  return `${randomUUID()}.${ext}`;
}
