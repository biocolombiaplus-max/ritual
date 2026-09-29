"use client";

import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

interface SectionData {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
}

const EMPTY: SectionData = { title: "", subtitle: "", imageUrl: "", linkUrl: "", linkText: "" };

const SECTIONS: {
  key: string;
  label: string;
  help?: string;
  titleLabel?: string;
  subtitleLabel?: string;
  showLink?: boolean;
  showImage?: boolean;
}[] = [
  {
    key: "hero",
    label: "Banner principal (portada)",
    showLink: true,
    showImage: true,
  },
  {
    key: "brand_story",
    label: "Nuestra filosofía",
    help: "Sección de marca en la home: una foto grande junto a un texto que cuenta quién eres y por qué comprarte a ti.",
    titleLabel: "Título",
    subtitleLabel: "Texto",
    showLink: true,
    showImage: true,
  },
  {
    key: "banner_promo",
    label: "Banner promocional (envío gratis)",
    showLink: true,
    showImage: true,
  },
  {
    key: "newsletter",
    label: "Newsletter (captura de correo)",
    help: "Texto de la sección donde el visitante deja su correo para recibir novedades y descuentos.",
    titleLabel: "Título",
    subtitleLabel: "Texto",
    showLink: false,
    showImage: false,
  },
];

export default function SeccionesPage() {
  const [logo, setLogo] = useState<SectionData>(EMPTY);
  const [data, setData] = useState<Record<string, SectionData>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/sections")
      .then((r) => r.json())
      .then((d) => {
        setLogo({ ...EMPTY, ...d.sections.logo });
        const next: Record<string, SectionData> = {};
        for (const s of SECTIONS) next[s.key] = { ...EMPTY, ...d.sections[s.key] };
        setData(next);
        setLoading(false);
      });
  }, []);

  function update(key: string, patch: Partial<SectionData>) {
    setData((d) => ({ ...d, [key]: { ...d[key], ...patch } }));
  }

  async function save(key: string, sectionData: SectionData) {
    setSavingKey(key);
    await fetch("/api/admin/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, ...sectionData }),
    });
    setSavingKey(null);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 1500);
  }

  if (loading) return <p className="text-muted text-sm">Cargando...</p>;

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-display text-2xl">Secciones e imágenes</h1>
      <p className="text-sm text-muted -mt-6">
        Todo lo que ves aquí se refleja en la página de inicio al momento de guardar. Para los beneficios, el
        proceso de compra y los testimonios, ve a{" "}
        <a href="/admin/contenido" className="text-rose-300 underline">Contenido de inicio</a>.
      </p>

      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg">Logo de Ritual.com</h2>
        <p className="text-sm text-muted">
          Sube tu logo en PNG o SVG con fondo transparente para que se vea en
          el menú y el pie de página. Si no subes uno, se usa el logo por
          defecto.
        </p>
        <ImageUploader
          images={logo.imageUrl ? [logo.imageUrl] : []}
          onChange={(images) => setLogo({ ...logo, imageUrl: images[0] ?? "" })}
          multiple={false}
        />
        <button onClick={() => save("logo", logo)} disabled={savingKey === "logo"} className="btn-primary">
          {savingKey === "logo" ? "Guardando..." : savedKey === "logo" ? "¡Guardado!" : "Guardar logo"}
        </button>
      </div>

      {SECTIONS.map((s) => {
        const value = data[s.key] ?? EMPTY;
        return (
          <div key={s.key} className="card p-6 space-y-4">
            <h2 className="font-display text-lg">{s.label}</h2>
            {s.help && <p className="text-sm text-muted -mt-2">{s.help}</p>}
            <div>
              <label className="label">{s.titleLabel ?? "Título"}</label>
              <input className="input" value={value.title} onChange={(e) => update(s.key, { title: e.target.value })} />
            </div>
            <div>
              <label className="label">{s.subtitleLabel ?? "Subtítulo"}</label>
              <textarea className="input" rows={2} value={value.subtitle} onChange={(e) => update(s.key, { subtitle: e.target.value })} />
            </div>
            {s.showLink && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Texto del botón</label>
                  <input className="input" value={value.linkText} onChange={(e) => update(s.key, { linkText: e.target.value })} />
                </div>
                <div>
                  <label className="label">Enlace del botón</label>
                  <input className="input" value={value.linkUrl} onChange={(e) => update(s.key, { linkUrl: e.target.value })} placeholder="/tienda" />
                </div>
              </div>
            )}
            {s.showImage && (
              <div>
                <label className="label">Imagen</label>
                <ImageUploader
                  images={value.imageUrl ? [value.imageUrl] : []}
                  onChange={(images) => update(s.key, { imageUrl: images[0] ?? "" })}
                  multiple={false}
                />
              </div>
            )}
            <button onClick={() => save(s.key, value)} disabled={savingKey === s.key} className="btn-primary">
              {savingKey === s.key ? "Guardando..." : savedKey === s.key ? "¡Guardado!" : "Guardar cambios"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
