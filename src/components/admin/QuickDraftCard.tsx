"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCOP } from "@/lib/format";

export interface QuickPhoto {
  id: string;
  file: File;
  preview: string;
}

export interface QuickDraft {
  id: string;
  photoIds: string[];
  name: string;
  categoryName: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  shortDescription: string;
  description: string;
  featured: boolean;
  active: boolean;
  expanded?: boolean;
  status: "draft" | "saving" | "done" | "error";
  error?: string;
  ai?: "loading" | "done" | "error";
  aiNote?: string;
  // Después de publicar
  productId?: string;
  slug?: string;
  deleting?: boolean;
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="label !mb-1">{children}</span>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
        checked ? "bg-gradient-rose text-[#1a1216] border-transparent" : "border-surface-border text-muted"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${checked ? "bg-[#1a1216]" : "bg-surface-border"}`} />
      {label}
    </button>
  );
}

export default function QuickDraftCard({
  draft: d,
  photo,
  aiAvailable,
  busy,
  onChange,
  onAi,
  onPublish,
  onRemovePhoto,
  onMakeCover,
  onDiscard,
  onDelete,
  onDefaultDescription,
}: {
  draft: QuickDraft;
  photo: (id: string) => QuickPhoto | undefined;
  aiAvailable: boolean;
  busy: boolean;
  onChange: (patch: Partial<QuickDraft>) => void;
  onAi: () => void;
  onPublish: () => void;
  onRemovePhoto: (photoId: string) => void;
  onMakeCover: (photoId: string) => void;
  onDiscard: () => void;
  onDelete: () => void;
  onDefaultDescription: () => string;
}) {
  const published = d.status === "done";
  const saving = d.status === "saving";
  const cover = photo(d.photoIds[0])?.preview;

  return (
    <article
      className={`card overflow-hidden ${
        published ? "border-rose-400/40" : d.status === "error" ? "border-red-400/50" : ""
      }`}
    >
      {/* Cabecera */}
      <div className="flex items-center gap-3 border-b border-surface-border p-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-background-soft">
          {cover && <Image src={cover} alt="" fill className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {published ? (
              <span className="rounded-full bg-rose-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300">
                ✓ Publicado
              </span>
            ) : d.status === "error" ? (
              <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                Revisar
              </span>
            ) : (
              <span className="rounded-full bg-surface-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                Borrador
              </span>
            )}
            {d.featured && (
              <span className="rounded-full bg-surface-border px-2 py-0.5 text-[10px] font-bold text-rose-300">★ Destacado</span>
            )}
          </div>
          <p className="mt-1 truncate text-sm font-medium">{d.name || "Sin nombre todavía"}</p>
          <p className="truncate text-xs text-muted">
            {[d.categoryName, d.price ? formatCOP(Number(d.price) || 0) : null].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {/* Acciones de un producto publicado */}
      {published && (
        <div className="grid grid-cols-3 gap-2 p-4">
          <Link href={`/producto/${d.slug}`} target="_blank" className="rounded-xl bg-background-soft px-3 py-2.5 text-center text-xs font-semibold">
            👁 Ver
          </Link>
          <Link href={`/admin/productos/${d.productId}/editar`} target="_blank" className="rounded-xl bg-background-soft px-3 py-2.5 text-center text-xs font-semibold">
            ✏️ Editar
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={d.deleting}
            className="rounded-xl bg-red-400/10 px-3 py-2.5 text-xs font-semibold text-red-400 disabled:opacity-50"
          >
            {d.deleting ? "Eliminando..." : "🗑 Eliminar"}
          </button>
        </div>
      )}

      {!published && (
        <div className="space-y-4 p-4">
          {/* Fotos */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {d.photoIds.map((pid, i) => {
              const p = photo(pid);
              if (!p) return null;
              return (
                <div key={pid} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => onMakeCover(pid)}
                    title="Usar como portada"
                    className={`relative block h-20 w-20 overflow-hidden rounded-xl ring-2 ${
                      i === 0 ? "ring-rose-400" : "ring-surface-border"
                    }`}
                  >
                    <Image src={p.preview} alt="" fill className="object-cover" />
                  </button>
                  {i === 0 && (
                    <span className="absolute inset-x-0 bottom-0 rounded-b-xl bg-black/70 py-0.5 text-center text-[9px] font-bold text-white">
                      Portada
                    </span>
                  )}
                  {!saving && (
                    <button
                      type="button"
                      onClick={() => onRemovePhoto(pid)}
                      className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white"
                      aria-label="Quitar foto"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <Label>Nombre del producto</Label>
            <div className="flex gap-2">
              <input
                value={d.name}
                onChange={(e) => onChange({ name: e.target.value, status: d.status === "error" ? "draft" : d.status })}
                placeholder="Ej: Vibrador Silk Touch"
                className="input flex-1"
                disabled={saving}
              />
              {aiAvailable && (
                <button
                  type="button"
                  onClick={onAi}
                  disabled={d.ai === "loading" || saving}
                  title="Autocompletar con IA desde la foto"
                  className="shrink-0 rounded-xl bg-surface-border px-3 text-sm font-semibold disabled:opacity-50"
                >
                  {d.ai === "loading" ? "⏳" : "✨ IA"}
                </button>
              )}
            </div>
            {d.aiNote && (
              <p className={`mt-1.5 text-[11px] font-medium ${d.ai === "error" ? "text-red-400" : "text-rose-300"}`}>{d.aiNote}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label>
              <Label>Categoría</Label>
              <input
                list="qb-categories"
                value={d.categoryName}
                onChange={(e) => onChange({ categoryName: e.target.value })}
                placeholder="Ej: Vibradores"
                className="input"
                disabled={saving}
              />
            </label>
            <label>
              <Label>Precio (COP)</Label>
              <input inputMode="numeric" value={d.price} onChange={(e) => onChange({ price: e.target.value.replace(/\D/g, "") })} className="input" disabled={saving} />
            </label>
          </div>

          {/* Más detalles */}
          <button
            type="button"
            onClick={() => onChange({ expanded: !d.expanded })}
            className="flex w-full items-center justify-between rounded-xl bg-background-soft px-3 py-2.5 text-xs font-semibold"
          >
            <span>📝 Descripción, precio anterior, stock y visibilidad</span>
            <span className={`transition-transform ${d.expanded ? "rotate-180" : ""}`}>▾</span>
          </button>

          {d.expanded && (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-muted">Descripción</span>
                  <button type="button" onClick={() => onChange({ description: onDefaultDescription() })} className="text-[11px] font-semibold text-rose-300">
                    ✨ Generar texto
                  </button>
                </span>
                <textarea
                  value={d.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  rows={4}
                  placeholder="Si lo dejas vacío, escribimos una descripción de venta automática."
                  className="input resize-y"
                  disabled={saving}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <Label>Precio antes (tachado)</Label>
                  <input inputMode="numeric" value={d.compareAtPrice} onChange={(e) => onChange({ compareAtPrice: e.target.value.replace(/\D/g, "") })} placeholder="Opcional" className="input" disabled={saving} />
                </label>
                <label>
                  <Label>Stock</Label>
                  <input inputMode="numeric" value={d.stock} onChange={(e) => onChange({ stock: e.target.value.replace(/\D/g, "") })} className="input" disabled={saving} />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Toggle label="Visible en la tienda" checked={d.active} onChange={(v) => onChange({ active: v })} />
                <Toggle label="Destacado en inicio" checked={d.featured} onChange={(v) => onChange({ featured: v })} />
              </div>
            </div>
          )}

          {d.error && <p className="rounded-xl bg-red-400/10 p-3 text-xs font-medium text-red-400">{d.error}</p>}

          <div className="flex items-center gap-2">
            <button type="button" onClick={onDiscard} disabled={saving} className="rounded-xl px-3 py-3 text-xs font-semibold text-muted hover:text-red-400">
              🗑 Quitar del lote
            </button>
            <button type="button" onClick={onPublish} disabled={saving || busy} className="btn-primary flex-1 !py-3 text-xs disabled:opacity-50">
              {saving ? "Publicando..." : "🚀 Publicar este"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
