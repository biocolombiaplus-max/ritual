"use client";

// Analítica propia (sin servicios externos): cada visitante anónimo tiene
// un sessionId guardado en localStorage, y se registran eventos clave del
// embudo de ventas (vista de página, agregar al carrito, iniciar checkout,
// compra) para verlos en /admin/analitica.

const SESSION_KEY = "ritual-analytics-session";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function track(type: string, extra?: { path?: string; productId?: string }) {
  if (typeof window === "undefined") return;
  const sessionId = getSessionId();
  if (!sessionId) return;
  const payload = JSON.stringify({ type, sessionId, ...extra });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      return;
    }
  } catch {
    // sigue al fetch de abajo
  }
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
