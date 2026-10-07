"use client";

import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart";
import {
  adviceMessage,
  cartMessage,
  catalogMessage,
  generalMessage,
  shippingMessage,
  waLink,
} from "@/lib/whatsapp";

// El mensaje cambia según la página desde la que escribe la clienta, para
// que el equipo de ventas responda directo sin tener que preguntar en qué
// puede ayudar.
function messageForPath(pathname: string, items: ReturnType<typeof useCartStore.getState>["items"], subtotal: number): string {
  if (pathname.startsWith("/producto/")) {
    const url = typeof window !== "undefined" ? window.location.href : "";
    return `¡Hola Ritual.com! 👋\nQuiero cerrar mi compra de este producto 🛍️\n\n${url}\n\n¿Me confirman disponibilidad y envío discreto?`;
  }
  if (pathname.startsWith("/carrito") && items.length > 0) return cartMessage(items, subtotal);
  if (pathname.startsWith("/tienda")) return catalogMessage();
  if (pathname.startsWith("/envios")) return shippingMessage();
  if (pathname.startsWith("/preguntas-frecuentes")) return adviceMessage();
  return generalMessage();
}

export default function WhatsAppFloat({ number }: { number: string | null }) {
  const pathname = usePathname() ?? "/";
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());

  if (!number || pathname.startsWith("/checkout")) return null;

  return (
    <a
      href={waLink(number, messageForPath(pathname, items, subtotal))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 active:scale-95"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      <svg viewBox="0 0 24 24" fill="currentColor" className="relative h-7 w-7">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.07c-.24.68-1.4 1.3-1.93 1.37-.5.07-1.1.1-1.77-.11a16.3 16.3 0 0 1-1.58-.58c-2.78-1.2-4.6-4.02-4.74-4.2-.14-.19-1.14-1.51-1.14-2.88s.72-2.04.98-2.32c.26-.28.56-.35.75-.35h.54c.17 0 .4-.06.63.48.24.57.8 1.97.87 2.11.07.14.12.3.02.49-.1.19-.15.3-.29.47-.14.16-.3.36-.43.49-.14.14-.29.29-.12.57.17.28.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.33 1.44.28.14.44.12.6-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.64-.14.26.09 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
      </svg>
    </a>
  );
}
