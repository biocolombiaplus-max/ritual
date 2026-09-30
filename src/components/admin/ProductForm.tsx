"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  id?: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number | string;
  compareAtPrice: number | string;
  sku: string;
  stock: number | string;
  weightGrams: number | string;
  categoryId: string;
  featured: boolean;
  active: boolean;
  images: string[];
}

const EMPTY: ProductData = {
  name: "",
  shortDescription: "",
  description: "",
  price: "",
  compareAtPrice: "",
  sku: "",
  stock: 10,
  weightGrams: 300,
  categoryId: "",
  featured: false,
  active: true,
  images: [],
};

export default function ProductForm({ initial }: { initial?: ProductData }) {
  const [form, setForm] = useState<ProductData>(initial ?? EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const router = useRouter();
  const isEdit = !!initial?.id;

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  async function aiFill() {
    if (!form.images[0]) {
      setAiNote("Sube al menos una foto primero.");
      return;
    }
    setAiLoading(true);
    setAiNote(null);
    try {
      const res = await fetch("/api/admin/ai-describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: form.images[0], categories: categories.map((c) => c.name) }),
      });
      if (res.status === 503) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "not_configured") setAiAvailable(false);
        setAiNote(
          data.error === "not_configured" ? "La IA no está activada todavía." : "La IA está ocupada, intenta en un momento."
        );
        return;
      }
      if (!res.ok) throw new Error();
      const { suggestion } = (await res.json()) as {
        suggestion: { name: string; categoryName: string; shortDescription: string; description: string };
      };

      let categoryId = form.categoryId;
      const match = categories.find((c) => c.name.toLowerCase() === suggestion.categoryName.toLowerCase());
      if (match) {
        categoryId = match.id;
      } else if (suggestion.categoryName) {
        const catRes = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: suggestion.categoryName }),
        });
        const catData = await catRes.json();
        if (catRes.ok) {
          setCategories((c) => [...c, catData.category]);
          categoryId = catData.category.id;
        }
      }

      setForm((f) => ({
        ...f,
        name: suggestion.name,
        shortDescription: suggestion.shortDescription,
        description: suggestion.description,
        categoryId,
      }));
      setAiNote(`✨ Sugerido: ${suggestion.name}. Revísalo antes de guardar.`);
    } catch {
      setAiNote("No pudimos autocompletar. Escribe los datos a mano.");
    } finally {
      setAiLoading(false);
    }
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setCategories((c) => [...c, data.category]);
      setForm((f) => ({ ...f, categoryId: data.category.id }));
      setNewCategory("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.description || !form.price) {
      setError("Nombre, descripción y precio son obligatorios");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        shortDescription: form.shortDescription,
        description: form.description,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        sku: form.sku,
        stock: Number(form.stock),
        weightGrams: Number(form.weightGrams),
        categoryId: form.categoryId || null,
        featured: form.featured,
        active: form.active,
        images: form.images,
      };

      const res = await fetch(
        isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar el producto");
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg">Información básica</h2>
        <div>
          <label className="label">Nombre del producto</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Descripción corta (aparece en las tarjetas)</label>
          <input
            className="input"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Descripción completa</label>
          <textarea
            className="input"
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg">Precio e inventario</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Precio (COP)</label>
            <input
              type="number"
              className="input"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Precio antes de descuento (opcional)</label>
            <input
              type="number"
              className="input"
              value={form.compareAtPrice}
              onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
            />
          </div>
          <div>
            <label className="label">SKU / Referencia</label>
            <input
              className="input"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Stock disponible</label>
            <input
              type="number"
              className="input"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Peso aproximado (gramos)</label>
            <input
              type="number"
              className="input"
              value={form.weightGrams}
              onChange={(e) => setForm({ ...form, weightGrams: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg">Categoría</h2>
        <select
          className="input"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Crear nueva categoría"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button type="button" onClick={addCategory} className="btn-secondary shrink-0">
            Agregar
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg">Imágenes del producto</h2>
        <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
        {aiAvailable && (
          <div className="rounded-xl bg-background-soft p-3">
            <button
              type="button"
              onClick={aiFill}
              disabled={aiLoading || !form.images[0]}
              className="btn-secondary w-full disabled:opacity-50"
            >
              {aiLoading ? "⏳ Generando..." : "✨ Autocompletar nombre y descripción con IA"}
            </button>
            <p className="mt-2 text-[11px] text-muted">
              Usa la primera foto para sugerir nombre, categoría y descripción. Revísalo antes de guardar.
            </p>
            {aiNote && <p className="mt-1.5 text-[11px] font-medium text-rose-300">{aiNote}</p>}
          </div>
        )}
      </div>

      <div className="card p-6 space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Mostrar en destacados de la página de inicio
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Producto activo (visible en la tienda)
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
