"use client";

import { useState } from "react";

export interface ContentItemData {
  id: string;
  group: string;
  icon: string | null;
  title: string;
  subtitle: string | null;
  body: string | null;
  rating: number | null;
  position: number;
  active: boolean;
}

interface FieldConfig {
  showIcon?: boolean;
  titleLabel: string;
  titlePlaceholder?: string;
  showSubtitle?: boolean;
  subtitleLabel?: string;
  subtitlePlaceholder?: string;
  showBody?: boolean;
  bodyLabel?: string;
  bodyPlaceholder?: string;
  showRating?: boolean;
}

const EMPTY_FORM = { icon: "", title: "", subtitle: "", body: "", rating: 5 };

export default function ContentGroupEditor({
  group,
  label,
  help,
  fields,
  items,
  onChange,
}: {
  group: string;
  label: string;
  help?: string;
  fields: FieldConfig;
  items: ContentItemData[];
  onChange: () => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    setError(null);
    setAdding(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group,
          icon: form.icon,
          title: form.title,
          subtitle: form.subtitle,
          body: form.body,
          rating: fields.showRating ? Number(form.rating) : null,
        }),
      });
      if (!res.ok) throw new Error();
      setForm(EMPTY_FORM);
      onChange();
    } catch {
      setError("No se pudo agregar. Intenta de nuevo.");
    } finally {
      setAdding(false);
    }
  }

  async function updateItem(item: ContentItemData, patch: Partial<ContentItemData>) {
    await fetch(`/api/admin/content/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, ...patch }),
    });
    onChange();
  }

  async function removeItem(id: string) {
    if (!confirm("¿Eliminar este elemento?")) return;
    await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
    onChange();
  }

  async function move(item: ContentItemData, direction: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.position - b.position);
    const index = sorted.findIndex((i) => i.id === item.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;
    await Promise.all([
      updateItem(item, { position: swapWith.position }),
      updateItem(swapWith, { position: item.position }),
    ]);
  }

  const sorted = [...items].sort((a, b) => a.position - b.position);

  return (
    <div className="card p-6 space-y-5">
      <div>
        <h2 className="font-display text-lg">{label}</h2>
        {help && <p className="text-sm text-muted mt-1">{help}</p>}
      </div>

      <div className="space-y-3">
        {sorted.map((item, i) => (
          <div key={item.id} className="rounded-lg border border-surface-border p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
              {fields.showIcon && (
                <input
                  value={item.icon ?? ""}
                  onChange={(e) => updateItem(item, { icon: e.target.value })}
                  className="input w-16 text-center text-lg"
                  placeholder="🚚"
                />
              )}
              <input
                value={item.title}
                onChange={(e) => updateItem(item, { title: e.target.value })}
                className="input"
                placeholder={fields.titlePlaceholder}
              />
            </div>
            {fields.showSubtitle && (
              <input
                value={item.subtitle ?? ""}
                onChange={(e) => updateItem(item, { subtitle: e.target.value })}
                className="input"
                placeholder={fields.subtitlePlaceholder}
              />
            )}
            {fields.showBody && (
              <textarea
                value={item.body ?? ""}
                onChange={(e) => updateItem(item, { body: e.target.value })}
                rows={2}
                className="input"
                placeholder={fields.bodyPlaceholder}
              />
            )}
            {fields.showRating && (
              <select
                value={item.rating ?? 5}
                onChange={(e) => updateItem(item, { rating: Number(e.target.value) })}
                className="input bg-background w-28"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)}
                  </option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-muted">
                <input type="checkbox" checked={item.active} onChange={(e) => updateItem(item, { active: e.target.checked })} />
                Visible
              </label>
              <div className="ml-auto flex items-center gap-1">
                <button type="button" onClick={() => move(item, -1)} disabled={i === 0} className="h-7 w-7 rounded border border-surface-border disabled:opacity-30">
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(item, 1)}
                  disabled={i === sorted.length - 1}
                  className="h-7 w-7 rounded border border-surface-border disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <button type="button" onClick={() => removeItem(item.id)} className="text-xs font-semibold text-red-400">
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-sm text-muted">Todavía no has agregado nada aquí.</p>}
      </div>

      <form onSubmit={addItem} className="rounded-lg bg-background-soft p-4 space-y-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">Agregar nuevo</p>
        <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
          {fields.showIcon && (
            <input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="input w-16 text-center text-lg"
              placeholder="🚚"
            />
          )}
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
            placeholder={fields.titlePlaceholder ?? fields.titleLabel}
          />
        </div>
        {fields.showSubtitle && (
          <input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="input"
            placeholder={fields.subtitlePlaceholder}
          />
        )}
        {fields.showBody && (
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={2}
            className="input"
            placeholder={fields.bodyPlaceholder}
          />
        )}
        {fields.showRating && (
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input bg-background w-28">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)}
              </option>
            ))}
          </select>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={adding} className="btn-secondary text-sm disabled:opacity-50">
          {adding ? "Agregando..." : "+ Agregar"}
        </button>
      </form>
    </div>
  );
}
