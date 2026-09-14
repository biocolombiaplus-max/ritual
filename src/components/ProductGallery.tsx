"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [];

  return (
    <div>
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-background-soft card">
        {list[active] ? (
          <Image
            src={list[active]}
            alt={name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted">
            Ritual.com
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-3 mt-4">
          {list.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 rounded-lg overflow-hidden border ${
                i === active ? "border-rose-400" : "border-surface-border"
              }`}
            >
              <Image src={src} alt={`${name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
