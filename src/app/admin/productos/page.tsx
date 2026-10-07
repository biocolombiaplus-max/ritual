"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatCOP } from "@/lib/format";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  featured: boolean;
  category: { name: string } | null;
  images: { url: string }[];
}

export default function ProductosPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [migrating, setMigrating] = useState(false);
  const [migrateNote, setMigrateNote] = useState<string | null>(null);

  const brokenCount = products.filter((p) =>
    p.images[0]?.url.includes("public.blob.vercel-storage.com")
  ).length;

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  async function recoverBrokenImages() {
    setMigrating(true);
    setMigrateNote(null);
    let totalMigrated = 0;
    let lastFailed: { productName: string; reason: string }[] = [];
    try {
      for (let i = 0; i < 50; i++) {
        const res = await fetch("/api/admin/migrate-images", { method: "POST" });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setMigrateNote(data?.error ?? "No se pudo ejecutar la recuperación.");
          break;
        }
        totalMigrated += data.migrated.length;
        lastFailed = data.failed;
        if (data.migrated.length === 0 && data.failed.length === 0) break; // nada más por procesar
        if (data.remaining === 0) break;
      }
      const parts = [`✅ ${totalMigrated} foto(s) recuperada(s) automáticamente.`];
      if (lastFailed.length > 0) {
        parts.push(
          `⚠ ${lastFailed.length} no se pudieron recuperar (Vercel ya no las sirve) — hay que resubirlas a mano: ${lastFailed
            .map((f) => f.productName)
            .join(", ")}.`
        );
      }
      setMigrateNote(parts.join(" "));
      load();
    } catch {
      setMigrateNote("Ocurrió un error de red durante la recuperación. Intenta de nuevo.");
    } finally {
      setMigrating(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl">Productos</h1>
        <div className="flex gap-3">
          <input
            className="input"
            placeholder="Buscar producto o SKU..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Link href="/admin/productos/carga-rapida" className="btn-secondary whitespace-nowrap">
            ⚡ Carga rápida
          </Link>
          <Link href="/admin/productos/nuevo" className="btn-primary whitespace-nowrap">
            + Nuevo producto
          </Link>
        </div>
      </div>

      {brokenCount > 0 && (
        <div className="card p-4 mb-6 border-amber-400/40 bg-amber-400/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-semibold text-amber-400">⚠ {brokenCount} producto(s)</span> con foto alojada en
              el Blob Store de Vercel suspendido.
            </p>
            <button onClick={recoverBrokenImages} disabled={migrating} className="btn-secondary whitespace-nowrap disabled:opacity-50">
              {migrating ? "⏳ Recuperando..." : "🔄 Recuperar fotos automáticamente"}
            </button>
          </div>
          {migrateNote && <p className="text-xs text-muted mt-3">{migrateNote}</p>}
        </div>
      )}

      {loading ? (
        <p className="text-muted text-sm">Cargando...</p>
      ) : products.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          <p className="mb-4">Aún no tienes productos.</p>
          <Link href="/admin/productos/nuevo" className="btn-primary">Crear el primero</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted border-b border-surface-border">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Estado</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-background-soft shrink-0">
                        {p.images[0] && (
                          <Image src={p.images[0].url} alt="" fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <div className="flex items-center gap-2">
                          {p.featured && <span className="text-[10px] text-rose-300">Destacado</span>}
                          {p.images[0]?.url.includes("public.blob.vercel-storage.com") && (
                            <span
                              className="text-[10px] font-semibold text-amber-400"
                              title="Esta foto quedó en el Blob Store de Vercel suspendido. Edita el producto y vuelve a subirla."
                            >
                              ⚠ Foto rota, resubir
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{p.category?.name ?? "—"}</td>
                  <td className="p-4">{formatCOP(p.price)}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.active ? "bg-rose-400/20 text-rose-300" : "bg-surface-border text-muted"
                      }`}
                    >
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <Link href={`/admin/productos/${p.id}/editar`} className="text-rose-300 hover:underline mr-4">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="text-muted hover:text-red-400">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
