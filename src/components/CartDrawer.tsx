"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { formatCOP } from "@/lib/format";
import FreeShippingBar from "./FreeShippingBar";
import type { ProductCardData } from "./ProductCard";

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const addItem = useCartStore((s) => s.addItem);

  const [suggestions, setSuggestions] = useState<ProductCardData[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/products?featured=1&limit=6")
      .then((r) => r.json())
      .then((data) => {
        const ids = new Set(items.map((i) => i.productId));
        setSuggestions(
          (data.products as ProductCardData[]).filter((p) => !ids.has(p.id)).slice(0, 3)
        );
      })
      .catch(() => {});
  }, [isOpen, items]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={closeCart} />
      <div className="relative w-full max-w-md h-full bg-background border-l border-surface-border flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <h2 className="font-display text-xl">Tu carrito</h2>
          <button onClick={closeCart} aria-label="Cerrar carrito" className="h-8 w-8 rounded-full border border-surface-border flex items-center justify-center">
            ✕
          </button>
        </div>

        <div className="px-5 py-4 border-b border-surface-border">
          <FreeShippingBar subtotal={subtotal} />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 && (
            <p className="text-sm text-muted text-center py-10">
              Tu carrito está vacío.
            </p>
          )}
          {items.map((item) => (
            <div key={item.productId} className="flex gap-3">
              <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-background-soft shrink-0">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                <p className="text-rose-300 text-sm mt-1">{formatCOP(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="h-7 w-7 rounded-full border border-surface-border"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="text-sm w-5 text-center">{item.quantity}</span>
                  <button
                    className="h-7 w-7 rounded-full border border-surface-border"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="ml-auto text-xs text-muted hover:text-rose-300"
                    onClick={() => removeItem(item.productId)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {suggestions.length > 0 && (
            <div className="pt-4 border-t border-surface-border">
              <p className="text-sm font-medium mb-3">
                Completa tu pedido y acércate al envío gratis
              </p>
              <div className="space-y-3">
                {suggestions.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-background-soft shrink-0">
                      {p.image && (
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs line-clamp-1">{p.name}</p>
                      <p className="text-rose-300 text-xs">{formatCOP(p.price)}</p>
                    </div>
                    <button
                      className="text-xs btn-secondary !px-3 !py-1.5"
                      onClick={() =>
                        addItem({
                          productId: p.id,
                          slug: p.slug,
                          name: p.name,
                          price: p.price,
                          image: p.image,
                        })
                      }
                    >
                      Añadir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-surface-border space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-display text-lg">{formatCOP(subtotal)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={closeCart}
            className={`btn-primary w-full ${items.length === 0 ? "pointer-events-none opacity-50" : ""}`}
          >
            Finalizar compra
          </Link>
          <Link href="/carrito" onClick={closeCart} className="btn-secondary w-full">
            Ver carrito completo
          </Link>
        </div>
      </div>
    </div>
  );
}
