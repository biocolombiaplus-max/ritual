"use client";

import { useEffect, useState } from "react";
import ContentGroupEditor, { type ContentItemData } from "@/components/admin/ContentGroupEditor";

export default function ContenidoPage() {
  const [items, setItems] = useState<ContentItemData[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/content");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="text-muted text-sm">Cargando...</p>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl">Contenido de inicio</h1>
        <p className="text-sm text-muted mt-1">
          Administra los bloques repetibles de la página de inicio: la barra de beneficios, los pasos de
          &ldquo;cómo funciona tu pedido&rdquo; y los testimonios de clientas/es.
        </p>
      </div>

      <ContentGroupEditor
        group="benefit"
        label="Barra de beneficios"
        help="Se muestra justo debajo del banner principal. Ideal 4 elementos cortos."
        fields={{
          showIcon: false,
          titleLabel: "Título",
          titlePlaceholder: "Ej: Envío discreto",
          showSubtitle: true,
          subtitleLabel: "Descripción",
          subtitlePlaceholder: "Ej: Sin logos en el empaque",
        }}
        items={items.filter((i) => i.group === "benefit")}
        onChange={load}
      />

      <ContentGroupEditor
        group="process"
        label="Cómo funciona tu pedido"
        help="Los pasos del proceso de compra, para generar confianza antes de pagar. Ideal 3 o 4 pasos."
        fields={{
          showIcon: true,
          titleLabel: "Título del paso",
          titlePlaceholder: "Ej: Elige tus productos",
          showBody: true,
          bodyLabel: "Descripción",
          bodyPlaceholder: "Ej: Explora el catálogo con total privacidad, sin registro obligatorio.",
        }}
        items={items.filter((i) => i.group === "process")}
        onChange={load}
      />

      <ContentGroupEditor
        group="testimonial"
        label="Testimonios"
        help="Reseñas de clientas y clientes. El nombre y la ciudad se muestran junto a la reseña; usa solo el primer nombre o iniciales para cuidar su privacidad."
        fields={{
          showIcon: false,
          titleLabel: "Nombre",
          titlePlaceholder: "Ej: Valentina R.",
          showSubtitle: true,
          subtitleLabel: "Ciudad",
          subtitlePlaceholder: "Ej: Bogotá",
          showBody: true,
          bodyLabel: "Reseña",
          bodyPlaceholder: "Ej: Llegó súper rápido y el empaque era totalmente discreto...",
          showRating: true,
        }}
        items={items.filter((i) => i.group === "testimonial")}
        onChange={load}
      />

      <ContentGroupEditor
        group="education"
        label="Centro de educación y bienestar"
        help="Artículos cortos de educación sexual y bienestar íntimo que se muestran en la página de inicio, para generar confianza y posicionar la marca como experta. Ideal 3 a 6 tarjetas."
        fields={{
          showIcon: true,
          titleLabel: "Título",
          titlePlaceholder: "Ej: Cómo elegir tu primer vibrador",
          showBody: true,
          bodyLabel: "Resumen (2-3 frases)",
          bodyPlaceholder: "Ej: Material, intensidad y tamaño son las tres variables clave...",
        }}
        items={items.filter((i) => i.group === "education")}
        onChange={load}
      />
    </div>
  );
}
