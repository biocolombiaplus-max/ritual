import { NextResponse } from "next/server";
import { hasR2 } from "@/lib/storage";

// Diagnóstico rápido: confirma si las credenciales de R2 funcionan en este
// entorno (Vercel) y si puede listar/leer objetos del bucket. Útil para
// distinguir "las credenciales están mal" de "el archivo puntual falla".

export async function GET() {
  const configured = hasR2();
  const env = {
    R2_ACCOUNT_ID: !!process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: !!process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: !!process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: !!process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: !!process.env.R2_PUBLIC_URL,
  };

  if (!configured) {
    return NextResponse.json({ configured, env, error: "Faltan variables R2_*" }, { status: 200 });
  }

  try {
    const { S3Client, ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME!, MaxKeys: 5 })
    );
    return NextResponse.json({
      configured,
      env,
      ok: true,
      bucket: process.env.R2_BUCKET_NAME,
      sampleKeys: (res.Contents ?? []).map((o) => o.Key),
      keyCount: res.KeyCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured,
        env,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : undefined,
      },
      { status: 200 }
    );
  }
}
