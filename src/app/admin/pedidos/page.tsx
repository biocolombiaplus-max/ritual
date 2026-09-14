"use client";

import { useEffect, useState } from "react";
import { formatCOP } from "@/lib/format";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderRow {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  department: string;
  city: string;
  notes: string | null;
  itemsJson: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  createdAt: string;
}

const STATUSES = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];

export default function PedidosPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Pedidos</h1>

      {loading ? (
        <p className="text-muted text-sm">Cargando...</p>
      ) : orders.length === 0 ? (
        <div className="card p-10 text-center text-muted">Todavía no hay pedidos.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const items: OrderItem[] = JSON.parse(o.itemsJson);
            const open = openId === o.id;
            return (
              <div key={o.id} className="card p-5">
                <div
                  className="flex flex-wrap items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setOpenId(open ? null : o.id)}
                >
                  <div>
                    <p className="font-medium">{o.code}</p>
                    <p className="text-xs text-muted">
                      {o.customerName} · {o.city}, {o.department} · {new Date(o.createdAt).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-rose-300">{formatCOP(o.total)}</span>
                    <select
                      value={o.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="input !py-1.5 !px-2 text-xs w-auto"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {open && (
                  <div className="mt-4 pt-4 border-t border-surface-border text-sm space-y-3">
                    <div className="grid sm:grid-cols-2 gap-4 text-muted">
                      <p><span className="text-foreground">Teléfono:</span> {o.phone}</p>
                      {o.email && <p><span className="text-foreground">Correo:</span> {o.email}</p>}
                      <p className="sm:col-span-2"><span className="text-foreground">Dirección:</span> {o.address}</p>
                      {o.notes && <p className="sm:col-span-2"><span className="text-foreground">Notas:</span> {o.notes}</p>}
                    </div>
                    <div className="divide-y divide-surface-border">
                      {items.map((i, idx) => (
                        <div key={idx} className="flex justify-between py-2">
                          <span>{i.quantity} × {i.name}</span>
                          <span>{formatCOP(i.price * i.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Subtotal</span>
                      <span>{formatCOP(o.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Envío</span>
                      <span>{o.shippingCost === 0 ? "Gratis" : formatCOP(o.shippingCost)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
