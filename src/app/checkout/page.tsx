"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { formatCOP } from "@/lib/format";
import ShippingCalculator from "@/components/ShippingCalculator";
import FreeShippingBar from "@/components/FreeShippingBar";
import { getSessionId, track } from "@/lib/analytics-client";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [shipping, setShipping] = useState<{ department: string; city: string; cost: number; eta: string } | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    track("begin_checkout");
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0) router.replace("/carrito");
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

  const total = subtotal + (shipping?.cost ?? 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!shipping) {
      setError("Selecciona tu departamento y ciudad para calcular el envío.");
      return;
    }
    if (!form.customerName || !form.phone || !form.address) {
      setError("Completa nombre, teléfono y dirección de envío.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          department: shipping.department,
          city: shipping.city,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          sessionId: getSessionId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo procesar el pedido");
      clear();
      router.push(`/checkout/gracias?code=${data.code}&total=${data.total}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl sm:text-4xl mb-8">Finalizar compra</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-6">
            <h2 className="font-display text-xl mb-4">Datos de envío</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre completo</label>
                <input
                  className="input"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Teléfono / WhatsApp</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Correo (opcional)</label>
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Dirección completa</label>
                <input
                  className="input"
                  placeholder="Calle, número, barrio, apto/casa"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Notas de entrega (opcional)</label>
                <textarea
                  className="input"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-xl mb-4">Cotizar envío</h2>
            <ShippingCalculator subtotal={subtotal} onChange={setShipping} />
          </div>

          <div className="card p-6">
            <h2 className="font-display text-xl mb-4">Método de pago</h2>
            <p className="text-sm text-muted">
              Al confirmar, recibirás tu pedido por WhatsApp para coordinar el
              pago mediante transferencia, PSE, tarjeta o contraentrega según
              disponibilidad en tu ciudad.
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="card p-6 h-fit sticky top-24 space-y-4">
          <h2 className="font-display text-xl">Resumen del pedido</h2>

          <FreeShippingBar subtotal={subtotal} />

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 border-t border-surface-border pt-4">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between text-sm">
                <span className="text-muted">
                  {i.quantity} × {i.name}
                </span>
                <span>{formatCOP(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-surface-border pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-muted">Envío</span>
              <span className="text-right">
                {shipping ? (shipping.cost === 0 ? "Gratis" : formatCOP(shipping.cost)) : "Por calcular"}
                {shipping?.eta && <span className="block text-[11px] text-rose-300">{shipping.eta}</span>}
              </span>
            </div>
            <div className="flex justify-between font-display text-lg pt-2 border-t border-surface-border">
              <span>Total</span>
              <span className="text-rose-300">{formatCOP(total)}</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Procesando..." : "Confirmar pedido"}
          </button>
          <Link href="/carrito" className="btn-secondary w-full">
            Volver al carrito
          </Link>
          <div className="flex items-center justify-center gap-4 pt-3 border-t border-surface-border text-[11px] text-muted">
            <span>🔒 Compra segura</span>
            <span>📦 Empaque discreto</span>
          </div>
        </div>
      </form>
    </div>
  );
}
