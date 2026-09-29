"use client";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Reduce el archivo si la foto es muy pesada (celulares modernos suben
// fotos de 12+ MP) antes de subirla, sin recortar ni deformar — mantiene
// la proporción original completa sobre fondo blanco.
export async function resizeForUpload(file: File, maxDimension = 1600): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    if (image.width <= maxDimension && image.height <= maxDimension) {
      return file;
    }
    const scale = maxDimension / Math.max(image.width, image.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg") || "foto.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Miniatura en base64 (sin el prefijo data:...) para enviar a la IA de
// autocompletado — se mantiene pequeña para que la respuesta sea rápida.
export async function toBase64Jpeg(file: File, max = 1024): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const scale = Math.min(1, max / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
  } finally {
    URL.revokeObjectURL(url);
  }
}
