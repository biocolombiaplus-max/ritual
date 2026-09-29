"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { resizeForUpload, toBase64Jpeg } from "@/lib/imageResize";
import QuickDraftCard, { type QuickDraft as Draft, type QuickPhoto as Photo } from "@/components/admin/QuickDraftCard";

// Carga rápida: sube muchas fotos de una sola vez (por ejemplo las que ya
// tienes en WhatsApp), agrúpalas por producto, completa lo mínimo (o con
// IA) y publica todo de un tirón — como en las grandes tiendas online.

let counter = 0;
const uid = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

function defaultDescription(name: string, categoryName: string): string {
  const product = name.trim() || "Este producto";
  const category = categoryName.trim();
  return `${product}. Calidad premium, materiales seguros y empaque 100% discreto.${
    category ? ` Parte de nuestra colección de ${category.toLowerCase()}.` : ""
  } Envío a todo Colombia.`;
}

function newDraft(photoIds: string[], defaults: { categoryName: string; price: string }): Draft {
  return {
    id: uid(),
    photoIds,
    name: "",
    categoryName: defaults.categoryName,
    price: defaults.price,
    compareAtPrice: "",
    stock: "20",
    shortDescription: "",
    description: "",
    featured: false,
    active: true,
    status: "draft",
  };
}

export default function CargaRapidaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [defaults, setDefaults] = useState({ categoryName: "", price: "" });
  const [publishing, setPublishing] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);

  const photoById = (id: string) => photos.find((p) => p.id === id);
  const usedIds = new Set(drafts.flatMap((d) => d.photoIds));
  const tray = photos.filter((p) => !usedIds.has(p.id));

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories((d.categories ?? []).map((c: { name: string }) => c.name)));
  }, []);

  // Libera las vistas previas al salir.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const added: Photo[] = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ id: uid(), file, preview: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...added]);
  }

  function toggleSelect(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function createFromSelection() {
    if (!selected.length) return;
    setDrafts((d) => [newDraft(selected, defaults), ...d]);
    setSelected([]);
  }

  function eachPhotoAsProduct() {
    const ids = (selected.length ? selected : tray.map((p) => p.id)).slice();
    setDrafts((d) => [...ids.map((id) => newDraft([id], defaults)), ...d]);
    setSelected([]);
  }

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function removeDraft(id: string) {
    setDrafts((ds) => ds.filter((d) => d.id !== id));
  }

  function removePhotoFromDraft(draftId: string, photoId: string) {
    setDrafts((ds) =>
      ds.flatMap((d) => {
        if (d.id !== draftId) return [d];
        const photoIds = d.photoIds.filter((p) => p !== photoId);
        return photoIds.length ? [{ ...d, photoIds }] : [];
      })
    );
  }

  function makeCover(draftId: string, photoId: string) {
    setDrafts((ds) =>
      ds.map((d) => (d.id === draftId ? { ...d, photoIds: [photoId, ...d.photoIds.filter((p) => p !== photoId)] } : d))
    );
  }

  function discardPhoto(id: string) {
    setPhotos((ps) => ps.filter((p) => p.id !== id));
    setSelected((s) => s.filter((x) => x !== id));
  }

  async function aiFill(draft: Draft) {
    const cover = photoById(draft.photoIds[0]);
    if (!cover) return;
    updateDraft(draft.id, { ai: "loading", aiNote: undefined });
    try {
      const res = await fetch("/api/admin/ai-describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: await toBase64Jpeg(cover.file), categories }),
      });
      if (res.status === 503) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "not_configured") setAiAvailable(false);
        updateDraft(draft.id, {
          ai: "error",
          aiNote: data.error === "not_configured" ? "La IA no está activada todavía." : "La IA está ocupada, intenta en un momento.",
        });
        return;
      }
      if (!res.ok) throw new Error();
      const { suggestion } = (await res.json()) as {
        suggestion: { name: string; categoryName: string; shortDescription: string; description: string };
      };
      updateDraft(draft.id, {
        name: suggestion.name,
        categoryName: suggestion.categoryName,
        shortDescription: suggestion.shortDescription,
        description: suggestion.description,
        ai: "done",
        aiNote: `✨ Sugerido: ${suggestion.name}. Revísalo antes de publicar.`,
      });
    } catch {
      updateDraft(draft.id, { ai: "error", aiNote: "No pudimos autocompletar esta foto. Escribe los datos a mano." });
    }
  }

  async function aiFillAll() {
    for (const d of drafts.filter((x) => x.status === "draft" && !x.name.trim())) {
      // Uno por uno para no saturar la IA.
      await aiFill(d);
    }
  }

  async function publishOne(draft: Draft): Promise<void> {
    if (!draft.name.trim()) {
      updateDraft(draft.id, { status: "error", error: "Falta el nombre del producto." });
      return;
    }
    if (!draft.price) {
      updateDraft(draft.id, { status: "error", error: "Falta el precio." });
      return;
    }
    updateDraft(draft.id, { status: "saving", error: undefined });
    try {
      const images: string[] = [];
      for (const pid of draft.photoIds) {
        const photo = photoById(pid);
        if (!photo) continue;
        const resized = await resizeForUpload(photo.file);
        const fd = new FormData();
        fd.append("file", resized);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "No se pudo subir una imagen");
        images.push(data.url);
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name.trim(),
          shortDescription: draft.shortDescription.trim(),
          description: draft.description.trim() || defaultDescription(draft.name, draft.categoryName),
          price: Number(draft.price) || 0,
          compareAtPrice: Number(draft.compareAtPrice) > 0 ? Number(draft.compareAtPrice) : null,
          stock: Number(draft.stock) || 0,
          categoryName: draft.categoryName.trim() || null,
          featured: draft.featured,
          active: draft.active,
          images,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo publicar");

      if (draft.categoryName.trim() && !categories.some((c) => c.toLowerCase() === draft.categoryName.trim().toLowerCase())) {
        setCategories((c) => [...c, draft.categoryName.trim()]);
      }

      updateDraft(draft.id, {
        status: "done",
        productId: data.product.id,
        slug: data.product.slug,
      });
    } catch (err) {
      updateDraft(draft.id, { status: "error", error: err instanceof Error ? err.message : "No se pudo publicar. Intenta de nuevo." });
    }
  }

  async function deletePublished(draft: Draft) {
    if (!draft.productId) return;
    if (!confirm(`¿Eliminar "${draft.name}" de la tienda? Esta acción no se puede deshacer.`)) return;
    updateDraft(draft.id, { deleting: true });
    try {
      await fetch(`/api/admin/products/${draft.productId}`, { method: "DELETE" });
      setDrafts((ds) => ds.filter((x) => x.id !== draft.id));
      setPhotos((ps) => ps.filter((p) => !draft.photoIds.includes(p.id)));
    } catch {
      updateDraft(draft.id, { deleting: false });
    }
  }

  async function publishAll() {
    setPublishing(true);
    for (const d of drafts.filter((x) => x.status === "draft" || x.status === "error")) {
      await publishOne(d);
    }
    setPublishing(false);
  }

  const pending = drafts.filter((d) => d.status === "draft" || d.status === "error");
  const doneCount = drafts.filter((d) => d.status === "done").length;
  const missingName = pending.filter((d) => !d.name.trim()).length;

  return (
    <div className="pb-32 max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/productos" className="text-xs font-semibold text-muted hover:text-foreground">
            ← Productos
          </Link>
          <h1 className="mt-1 font-display text-2xl">⚡ Carga rápida</h1>
          <p className="text-sm text-muted">Sube muchas fotos de una sola vez y publica varios productos en minutos.</p>
        </div>
      </div>

      {/* Paso 1: fotos */}
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg">1. Elige tus fotos</h2>
          {photos.length > 0 && (
            <span className="text-xs font-semibold text-muted">
              {tray.length} sin asignar · {photos.length} en total
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-rose-400/40 bg-background-soft px-4 py-8 text-center transition-colors hover:border-rose-400"
        >
          <span className="text-3xl">📥</span>
          <span className="text-base font-bold uppercase">Elegir fotos</span>
          <span className="text-xs text-muted">Puedes seleccionar muchas a la vez desde tu galería o WhatsApp</span>
        </button>

        {tray.length > 0 && (
          <>
            <p className="mt-5 text-xs font-semibold">
              2. Toca las fotos de un mismo producto (en el orden que quieras mostrarlas) y crea el producto:
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {tray.map((p) => {
                const order = selected.indexOf(p.id);
                return (
                  <div key={p.id} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleSelect(p.id)}
                      className={`relative block aspect-square w-full overflow-hidden rounded-xl ring-2 transition-all ${
                        order >= 0 ? "ring-rose-400 ring-offset-2 ring-offset-background" : "ring-transparent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.preview} alt="" className="h-full w-full object-cover" />
                      {order >= 0 && (
                        <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-400 text-xs font-bold text-[#1a1216]">
                          {order + 1}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => discardPhoto(p.id)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white"
                      aria-label="Descartar foto"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={createFromSelection} disabled={!selected.length} className="btn-primary flex-1 disabled:opacity-40">
                ➕ Crear producto {selected.length ? `con ${selected.length} foto${selected.length > 1 ? "s" : ""}` : ""}
              </button>
              <button type="button" onClick={eachPhotoAsProduct} className="btn-secondary flex-1">
                {selected.length ? "Cada foto seleccionada = 1 producto" : `Cada foto = 1 producto (${tray.length})`}
              </button>
            </div>
          </>
        )}
      </section>

      {/* Valores por defecto */}
      <section className="mt-5 card p-5 sm:p-6">
        <h2 className="font-display text-lg">Valores para los productos nuevos</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            Categoría
            <input
              list="qb-categories"
              value={defaults.categoryName}
              onChange={(e) => setDefaults({ ...defaults, categoryName: e.target.value })}
              placeholder="Ej: Vibradores"
              className="input mt-1"
            />
          </label>
          <label className="text-xs font-semibold">
            Precio (COP)
            <input
              inputMode="numeric"
              value={defaults.price}
              onChange={(e) => setDefaults({ ...defaults, price: e.target.value.replace(/\D/g, "") })}
              className="input mt-1"
            />
          </label>
        </div>
        <datalist id="qb-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </section>

      {/* Borradores y publicados */}
      {drafts.length > 0 && (
        <section className="mt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg">
              3. Revisa y publica ({pending.length} por publicar{doneCount ? ` · ${doneCount} publicados` : ""})
            </h2>
            {aiAvailable && pending.some((d) => !d.name.trim()) && (
              <button type="button" onClick={aiFillAll} className="rounded-full bg-surface-border px-4 py-2 text-xs font-bold">
                ✨ Autocompletar todos con IA
              </button>
            )}
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-2">
            {drafts.map((d) => (
              <QuickDraftCard
                key={d.id}
                draft={d}
                photo={photoById}
                aiAvailable={aiAvailable}
                busy={publishing}
                onChange={(patch) => updateDraft(d.id, patch)}
                onAi={() => aiFill(d)}
                onPublish={() => publishOne(d)}
                onRemovePhoto={(pid) => removePhotoFromDraft(d.id, pid)}
                onMakeCover={(pid) => makeCover(d.id, pid)}
                onDiscard={() => removeDraft(d.id)}
                onDelete={() => deletePublished(d)}
                onDefaultDescription={() => defaultDescription(d.name, d.categoryName)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Barra de publicar */}
      {pending.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-border bg-background/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:pl-64">
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <p className="hidden flex-1 text-xs text-muted sm:block">
              {missingName ? `A ${missingName} producto(s) les falta el nombre.` : "Todo listo para publicar."}
            </p>
            <button type="button" onClick={publishAll} disabled={publishing} className="btn-primary flex-1 !py-3.5 disabled:opacity-60 sm:flex-none sm:px-10">
              {publishing ? "Publicando..." : `🚀 Publicar ${pending.length} producto${pending.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
      {!pending.length && doneCount > 0 && (
        <div className="mt-6 card bg-background-soft p-6 text-center">
          <p className="text-lg font-bold uppercase">
            🎉 ¡{doneCount} producto{doneCount > 1 ? "s" : ""} publicado{doneCount > 1 ? "s" : ""}!
          </p>
          <p className="mt-1 text-sm text-muted">Ya están en tu tienda. Puedes editar precios o descripciones desde Productos.</p>
          <Link href="/admin/productos" className="btn-primary mt-4 inline-flex">
            Ver mis productos
          </Link>
        </div>
      )}
    </div>
  );
}
