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

export default function SeccionesPage() {
  const [logo, setLogo] = useState<SectionData>(EMPTY);
  const [hero, setHero] = useState<SectionData>(EMPTY);
  const [banner, setBanner] = useState<SectionData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/sections")
      .then((r) => r.json())
      .then((d) => {
        setLogo({ ...EMPTY, ...d.sections.logo });
        setHero({ ...EMPTY, ...d.sections.hero });
        setBanner({ ...EMPTY, ...d.sections.banner_promo });
        setLoading(false);
      });
  }, []);

  async function save(key: string, data: SectionData) {
    setSavingKey(key);
    await fetch("/api/admin/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, ...data }),
    });
    setSavingKey(null);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 1500);
  }

  if (loading) return <p className="text-muted text-sm">Cargando...</p>;

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-display text-2xl">Secciones e imágenes</h1>

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

      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg">Banner principal (portada)</h2>
        <div>
          <label className="label">Título</label>
          <input className="input" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Subtítulo</label>
          <textarea className="input" rows={2} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Texto del botón</label>
            <input className="input" value={hero.linkText} onChange={(e) => setHero({ ...hero, linkText: e.target.value })} />
          </div>
          <div>
            <label className="label">Enlace del botón</label>
            <input className="input" value={hero.linkUrl} onChange={(e) => setHero({ ...hero, linkUrl: e.target.value })} placeholder="/tienda" />
          </div>
        </div>
        <div>
          <label className="label">Imagen de fondo</label>
          <ImageUploader
            images={hero.imageUrl ? [hero.imageUrl] : []}
            onChange={(images) => setHero({ ...hero, imageUrl: images[0] ?? "" })}
            multiple={false}
          />
        </div>
        <button onClick={() => save("hero", hero)} disabled={savingKey === "hero"} className="btn-primary">
          {savingKey === "hero" ? "Guardando..." : savedKey === "hero" ? "¡Guardado!" : "Guardar banner"}
        </button>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg">Banner promocional (envío gratis)</h2>
        <div>
          <label className="label">Título</label>
          <input className="input" value={banner.title} onChange={(e) => setBanner({ ...banner, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Subtítulo</label>
          <textarea className="input" rows={2} value={banner.subtitle} onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Texto del botón</label>
            <input className="input" value={banner.linkText} onChange={(e) => setBanner({ ...banner, linkText: e.target.value })} />
          </div>
          <div>
            <label className="label">Enlace del botón</label>
            <input className="input" value={banner.linkUrl} onChange={(e) => setBanner({ ...banner, linkUrl: e.target.value })} placeholder="/tienda" />
          </div>
        </div>
        <div>
          <label className="label">Imagen de fondo</label>
          <ImageUploader
            images={banner.imageUrl ? [banner.imageUrl] : []}
            onChange={(images) => setBanner({ ...banner, imageUrl: images[0] ?? "" })}
            multiple={false}
          />
        </div>
        <button onClick={() => save("banner_promo", banner)} disabled={savingKey === "banner_promo"} className="btn-primary">
          {savingKey === "banner_promo" ? "Guardando..." : savedKey === "banner_promo" ? "¡Guardado!" : "Guardar banner"}
        </button>
      </div>
    </div>
  );
}
