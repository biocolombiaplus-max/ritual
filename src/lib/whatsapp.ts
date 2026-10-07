import { formatCOP } from "./format";
import type { CartItem } from "@/store/cart";

// Mensajes de WhatsApp personalizados según la sección desde la que escribe
// la clienta, para que el equipo de ventas sepa de inmediato qué necesita
// sin tener que preguntar "¿en qué te ayudo?".

const HELLO = "¡Hola Ritual.com! 👋";

export function waLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function generalMessage(topic = "Quiero información sobre sus productos."): string {
  return `${HELLO}\n${topic}`;
}

export function catalogMessage(): string {
  return `${HELLO}\nQuiero ver el catálogo completo. ¿Me ayudan a elegir? ✨`;
}

export function adviceMessage(): string {
  return `${HELLO}\nQuiero asesoría personalizada y 100% discreta para elegir mi producto ideal 💬\n\n• Busco para: \n• Primera vez o ya tengo experiencia: \n• Presupuesto aprox.: `;
}

export function educationMessage(topic: string): string {
  return `${HELLO}\nTengo una duda sobre "${topic}". ¿Me pueden orientar? 🙏`;
}

export function shippingMessage(): string {
  return `${HELLO}\nQuiero confirmar el envío discreto y los tiempos de entrega a mi ciudad 📦`;
}

export function cartMessage(items: CartItem[], subtotal: number): string {
  const lines = items.map((i) => `• ${i.name} ×${i.quantity} — ${formatCOP(i.price * i.quantity)}`);
  return `${HELLO}\nQuiero cerrar mi compra 🛍️\n\n${lines.join("\n")}\n\nSubtotal: ${formatCOP(subtotal)}\n\n¿Me ayudan a confirmar el envío y el pago?`;
}

export function productMessage(
  product: { name: string; price: number; slug: string },
  appUrl: string
): string {
  const url = `${appUrl.replace(/\/$/, "")}/producto/${product.slug}`;
  return `${HELLO}\nQuiero cerrar mi compra de este producto 🛍️\n\n*${product.name}*\n💲 ${formatCOP(product.price)}\n${url}\n\n¿Me confirman disponibilidad y envío discreto a mi ciudad?`;
}
