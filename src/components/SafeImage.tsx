"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

// Nunca mostrar el ícono de imagen rota del navegador: si la URL ya se
// sabe muerta (ej. el Blob Store de Vercel que Vercel bloqueó por
// completo, lectura incluida) o si falla al cargar por cualquier otro
// motivo, se muestra un ícono de respaldo en vez de romper el layout.

const DEAD_DOMAINS = ["public.blob.vercel-storage.com"];

function isKnownDead(src: ImageProps["src"]) {
  return typeof src === "string" && DEAD_DOMAINS.some((d) => src.includes(d));
}

// Las fotos que vienen de nuestro propio proxy (/api/img/...) se sirven
// directo, sin pasar por el optimizador de imágenes de Next — ese
// optimizador le pide la imagen a nuestro propio proxy en un segundo
// salto, y si tarda un poco más de la cuenta (arranque en frío, R2 lento
// un instante) lo marca como fallo aunque la foto exista. Para algo que
// tiene que "nunca fallar", menos saltos es más confiable.
function needsDirectServe(src: ImageProps["src"]) {
  return typeof src === "string" && src.startsWith("/api/img/");
}

export default function SafeImage({
  alt,
  fallbackIcon = "🖼️",
  className,
  ...props
}: ImageProps & { fallbackIcon?: string }) {
  const [failed, setFailed] = useState(() => isKnownDead(props.src) || !props.src);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-background-soft text-muted ${
          props.fill ? "absolute inset-0" : "h-full w-full"
        } ${className ?? ""}`}
      >
        <span className="text-2xl opacity-50">{fallbackIcon}</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      unoptimized={props.unoptimized ?? needsDirectServe(props.src)}
      onError={() => setFailed(true)}
    />
  );
}
