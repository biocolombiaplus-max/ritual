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

const OLD_BLOB_DOMAIN = "public.blob.vercel-storage.com";
const RATE_LIMITED_R2_DOMAIN = ".r2.dev";

export default function ProductosPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [onlyBroken, setOnlyBroken] = useState(false);
  const [fixingUrls, setFixingUrls] = useState(false);
  const [fixNote, setFixNote] = useState<string | null>(null);

  const brokenCount = products.filter((p) => p.images[0]?.url.includes(OLD_BLOB_DOMAIN)).length;
  const rateLimitedCount = products.filter((p) => p.images[0]?.url.includes(RATE_LIMITED_R2_DOMAIN)).length;
  const visibleProducts = onlyBroken
    ? products.filter((p) => p.images[0]?.url.includes(OLD_BLOB_DOMAIN))
    : products;

  async function fixImageUrls() {
    setFixingUrls(true);
    setFixNote(null);
    try {
      const res = await fetch("/api/admin/fix-image-urls", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "No se pudo optimizar");
      setFixNote(`✅ ${data.updatedProductImages} foto(s) de producto y ${data.updatedSections} de secciones ya cargan sin límite de Cloudflare.`);
      load();
    } catch (err) {
      setFixNote(err instanceof Error ? err.message : "No se pudo optimizar");
    } finally {
      setFixingUrls(false);
    }
  }

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

      {rateLimitedCount > 0 && (
        <div className="card p-4 mb-6 border-sky-400/40 bg-sky-400/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-semibold text-sky-400">ℹ {rateLimitedCount} producto(s)</span> con foto servida
              desde la URL pública de Cloudflare R2, que tiene límite de tráfico y por eso a veces no carga. Se puede
              corregir sin volver a subir nada — solo cambia por dónde se sirve la misma foto.
            </p>
            <button onClick={fixImageUrls} disabled={fixingUrls} className="btn-primary whitespace-nowrap disabled:opacity-50">
              {fixingUrls ? "⏳ Optimizando..." : "⚡ Optimizar ahora"}
            </button>
          </div>
          {fixNote && <p className="text-xs text-muted mt-3">{fixNote}</p>}
        </div>
      )}

      {brokenCount > 0 && (
        <div className="card p-4 mb-6 border-amber-400/40 bg-amber-400/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-semibold text-amber-400">⚠ {brokenCount} producto(s)</span> con foto alojada en
              el Blob Store de Vercel suspendido. Vercel bloqueó también la lectura de esas fotos, así que no hay
              forma automática de recuperarlas — hay que resubirlas a mano desde &quot;Editar&quot;.
            </p>
            <button
              onClick={() => setOnlyBroken((v) => !v)}
              className="btn-secondary whitespace-nowrap"
            >
              {onlyBroken ? "Ver todos" : "Mostrar solo estos"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted text-sm">Cargando...</p>
      ) : visibleProducts.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          {onlyBroken ? (
            <p>No hay productos con fotos rotas 🎉</p>
          ) : (
            <>
              <p className="mb-4">Aún no tienes productos.</p>
              <Link href="/admin/productos/nuevo" className="btn-primary">Crear el primero</Link>
            </>
          )}
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
              {visibleProducts.map((p) => (
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
                          {p.images[0]?.url.includes(OLD_BLOB_DOMAIN) && (
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
