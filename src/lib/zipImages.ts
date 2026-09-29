"use client";

import JSZip from "jszip";

const IMAGE_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

const MAX_IMAGES_PER_ZIP = 300;

// Ignora carpetas de sistema/metadatos que Mac y Windows meten dentro de
// los ZIP sin que el usuario se dé cuenta.
function isJunk(path: string): boolean {
  const name = path.split("/").pop() ?? path;
  return (
    path.startsWith("__MACOSX/") ||
    name.startsWith(".") ||
    name.toLowerCase() === "thumbs.db" ||
    name.toLowerCase() === "desktop.ini"
  );
}

export interface ZipExtractResult {
  files: File[];
  skipped: number;
  truncated: boolean;
}

// Descomprime un .zip en el navegador y devuelve solo las imágenes que
// contiene, listas para usarse como si el usuario las hubiera
// seleccionado una por una.
export async function extractImagesFromZip(zipFile: File): Promise<ZipExtractResult> {
  const zip = await JSZip.loadAsync(zipFile);
  const entries = Object.values(zip.files).filter((entry) => !entry.dir && !isJunk(entry.name));

  const files: File[] = [];
  let skipped = 0;
  let truncated = false;

  for (const entry of entries) {
    const ext = entry.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = IMAGE_EXT[ext];
    if (!mimeType) {
      skipped++;
      continue;
    }
    if (files.length >= MAX_IMAGES_PER_ZIP) {
      truncated = true;
      break;
    }
    const blob = await entry.async("blob");
    const name = entry.name.split("/").pop() ?? entry.name;
    files.push(new File([blob], name, { type: mimeType }));
  }

  return { files, skipped, truncated };
}
