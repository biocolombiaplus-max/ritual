"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { formatCOP } from "@/lib/format";
import FreeShippingBar from "@/components/FreeShippingBar";
import ProductCard, { ProductCardData } from "@/components/ProductCard";

export default function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const [suggestions, setSuggestions] = useState<ProductCardData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetch("/api/products?limit=8")
      .then((r) => r.json())
      .then((data) => {
        const ids = new Set(items.map((i) => i.productId));
        setSuggestions((data.products as ProductCardData[]).filter((p) => !ids.has(p.id)).slice(0, 4));
      })
      .catch(() => {});
  }, [items]);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl sm:text-4xl mb-8">Tu carrito</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted mb-6">Tu carrito está vacío.</p>
          <Link href="/tienda" className="btn-primary">Ir a la tienda</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-4">
              <FreeShippingBar subtotal={subtotal} />
            </div>
            <div className="divide-y divide-surface-border card">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 p-4">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-background-soft shrink-0">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/producto/${item.slug}`} className="font-medium text-sm hover:text-rose-300 line-clamp-2">
                      {item.name}
                    </Link>
                    <p className="text-rose-300 text-sm mt-1">{formatCOP(item.price)}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        className="h-8 w-8 rounded-full border border-surface-border"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        className="h-8 w-8 rounded-full border border-surface-border"
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
                  <p className="font-display text-lg">{formatCOP(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {suggestions.length > 0 && (
              <div>
                <h2 className="font-display text-xl mb-4">También te puede interesar</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {suggestions.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card p-6 h-fit sticky top-24">
            <h2 className="font-display text-xl mb-4">Resumen</h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Subtotal</span>
              <span>{formatCOP(subtotal)}</span>
            </div>
            <p className="text-xs text-muted mb-4">
              El envío se calcula en el siguiente paso según tu ciudad.
            </p>
            <Link href="/checkout" className="btn-primary w-full">
              Finalizar compra
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
