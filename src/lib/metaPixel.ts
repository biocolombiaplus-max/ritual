"use client";

// Eventos estándar de Meta Pixel (Facebook/Instagram Ads) para optimizar
// campañas: ViewContent, AddToCart, InitiateCheckout y Purchase. Se usan
// junto a (no en lugar de) la analítica propia de src/lib/analytics-client.ts.

type FbqFn = (...args: unknown[]) => void;

export function fbTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: FbqFn }).fbq;
  if (typeof fbq === "function") fbq("track", event, params);
}
