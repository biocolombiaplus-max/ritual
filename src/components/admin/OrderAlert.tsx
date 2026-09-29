"use client";

import { useEffect, useRef, useState } from "react";
import { formatCOP } from "@/lib/format";

const SOUND_KEY = "ritual-admin-sound-enabled";
const LAST_SEEN_KEY = "ritual-admin-last-order-id";
const POLL_MS = 20000;

interface OrderRow {
  id: string;
  code: string;
  customerName: string;
  city: string;
  total: number;
  createdAt: string;
}

// Activo en todo el panel admin: cada POLL_MS revisa si llegó un pedido
// nuevo (comparando contra el último visto, guardado en localStorage) y, si
// el sonido está activado, reproduce un timbre y muestra un aviso emergente.
// No requiere servidor de notificaciones push: funciona mientras esta
// pestaña del navegador siga abierta (o en segundo plano).
export default function OrderAlert() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activating, setActivating] = useState(false);
  const [toastOrder, setToastOrder] = useState<OrderRow | null>(null);
  const soundEnabledRef = useRef(false);
  const lastSeenRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    try {
      setSoundEnabled(localStorage.getItem(SOUND_KEY) === "1");
      lastSeenRef.current = localStorage.getItem(LAST_SEEN_KEY);
    } catch {}
  }, []);

  function playChime() {
    try {
      const ctx = audioCtxRef.current ?? new AudioContext();
      audioCtxRef.current = ctx;
      const now = ctx.currentTime;
      [880, 1320].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.15 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.35);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.4);
      });
    } catch {}
  }

  async function handleActivate() {
    setActivating(true);
    try {
      playChime();
      setSoundEnabled(true);
      localStorage.setItem(SOUND_KEY, "1");
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } finally {
      setActivating(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) return;
        const data = (await res.json()) as { orders: OrderRow[] };
        const latest = data.orders[0];
        if (!latest || cancelled) return;

        if (!initialized.current) {
          initialized.current = true;
          if (lastSeenRef.current === null) {
            lastSeenRef.current = latest.id;
            localStorage.setItem(LAST_SEEN_KEY, latest.id);
          }
          return;
        }

        if (latest.id !== lastSeenRef.current) {
          lastSeenRef.current = latest.id;
          localStorage.setItem(LAST_SEEN_KEY, latest.id);
          setToastOrder(latest);
          if (toastTimeout.current) clearTimeout(toastTimeout.current);
          toastTimeout.current = setTimeout(() => setToastOrder(null), 10000);
          if (soundEnabledRef.current) playChime();
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("🛎️ Nuevo pedido en Ritual.com", {
              body: `${latest.code} · ${latest.customerName} · ${formatCOP(latest.total)}`,
            });
          }
        }
      } catch {}
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        {!soundEnabled ? (
          <button
            type="button"
            onClick={handleActivate}
            disabled={activating}
            title="Activa el sonido y las notificaciones de pedidos nuevos en este navegador"
            className="btn-secondary !py-2 !px-4 text-xs disabled:opacity-60"
          >
            {activating ? "Activando..." : "🔔 Activar alertas de pedidos"}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/15 px-3 py-1.5 text-xs font-semibold text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Alertas activas
          </span>
        )}
      </div>

      {toastOrder && (
        <div className="fixed right-4 top-20 z-[95] w-80 max-w-[calc(100vw-2rem)] card p-4 animate-fade-in">
          <p className="text-sm font-semibold">🛎️ ¡Nuevo pedido recibido!</p>
          <p className="mt-1 text-sm">
            {toastOrder.code} · <span className="font-semibold text-rose-300">{formatCOP(toastOrder.total)}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {toastOrder.customerName} · {toastOrder.city}
          </p>
          <button
            type="button"
            onClick={() => setToastOrder(null)}
            className="absolute right-2 top-2 text-xs text-muted hover:text-foreground"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
