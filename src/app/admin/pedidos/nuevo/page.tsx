"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/format";
import ShippingCalculator from "@/components/ShippingCalculator";

interface ProductOption {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductOption[] | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [pickProductId, setPickProductId] = useState("");
  const [pickQty, setPickQty] = useState(1);

  const [form, setForm] = useState({ customerName: "", phone: "", email: "", address: "", notes: "" });
  const [shipping, setShipping] = useState<{ department: string; city: string; cost: number; eta: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products?limit=200")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  const pickedProduct = products?.find((p) => p.id === pickProductId);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + (shipping?.cost ?? 0);

  function handleAddItem() {
    if (!pickedProduct) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === pickedProduct.id);
      if (existing) {
        return prev.map((i) => (i.productId === pickedProduct.id ? { ...i, quantity: i.quantity + pickQty } : i));
      }
      return [...prev, { productId: pickedProduct.id, name: pickedProduct.name, price: pickedProduct.price, quantity: pickQty }];
    });
    setPickProductId("");
    setPickQty(1);
  }

  function handleRemoveItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Agrega al menos un producto al pedido.");
      return;
    }
    if (!form.customerName.trim() || !form.phone.trim() || !form.address.trim()) {
      setError("Completa nombre, teléfono y dirección del cliente.");
      return;
    }
    if (!shipping) {
      setError("Selecciona el departamento y la ciudad para calcular el envío.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          department: shipping.department,
          city: shipping.city,
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear el pedido");
      router.push("/admin/pedidos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el pedido. Intenta de nuevo.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/pedidos" className="text-xs font-semibold text-muted hover:text-foreground">
        ← Volver a pedidos
      </Link>
      <h1 className="font-display text-2xl mt-1 mb-1">Crear pedido manual</h1>
      <p className="text-sm text-muted mb-6">
        Para pedidos que te llegaron por WhatsApp, Instagram o en persona — queda registrado igual que uno hecho
        desde la tienda.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6">
          <h2 className="font-display text-lg mb-4">Productos</h2>

          {items.length > 0 && (
            <ul className="mb-4 space-y-2">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-3 rounded-lg border border-surface-border p-3">
                  <div className="text-sm">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted">x{item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-rose-300">{formatCOP(item.price * item.quantity)}</span>
                    <button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-xs font-semibold text-red-400">
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-3 rounded-lg bg-background-soft p-4 sm:grid-cols-[1fr_auto_auto]">
            <select value={pickProductId} onChange={(e) => setPickProductId(e.target.value)} className="input bg-background">
              <option value="">{products === null ? "Cargando productos..." : "Selecciona un producto"}</option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCOP(p.price)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={pickQty}
              onChange={(e) => setPickQty(Math.max(1, Number(e.target.value)))}
              className="input w-20"
            />
            <button type="button" onClick={handleAddItem} disabled={!pickedProduct} className="btn-secondary disabled:opacity-50">
              + Agregar
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg mb-4">Datos del cliente</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nombre completo</label>
              <input
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="input"
                placeholder="Ej: María Pérez"
              />
            </div>
            <div>
              <label className="label">Teléfono / WhatsApp</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
                placeholder="Ej: 3001234567"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Correo (opcional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Dirección de envío</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input"
                placeholder="Calle, número, barrio, apto/casa"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Nota (opcional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg mb-4">Envío</h2>
          <ShippingCalculator subtotal={subtotal} onChange={setShipping} />
        </div>

        <div className="card p-6">
          <div className="flex justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span>{formatCOP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted">
            <span>Envío</span>
            <span>{shipping ? (shipping.cost === 0 ? "Gratis" : formatCOP(shipping.cost)) : "Por calcular"}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-surface-border pt-2 font-display text-lg">
            <span>Total</span>
            <span className="text-rose-300">{formatCOP(total)}</span>
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-400/10 p-3 text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
          {saving ? "Guardando..." : "Crear pedido"}
        </button>
      </form>
    </div>
  );
}
