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

  return <Image {...props} alt={alt} className={className} onError={() => setFailed(true)} />;
}
