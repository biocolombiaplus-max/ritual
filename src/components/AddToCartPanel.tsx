"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { formatCOP, FREE_SHIPPING_THRESHOLD } from "@/lib/format";

export default function AddToCartPanel({
  productId,
  slug,
  name,
  price,
  image,
  stock,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const subtotal = useCartStore((s) => s.subtotal());
  const router = useRouter();
  const outOfStock = stock <= 0;

  function handleAdd() {
    addItem({ productId, slug, name, price, image }, qty);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addItem({ productId, slug, name, price, image }, qty);
    router.push("/checkout");
  }

  const projected = subtotal + price * qty;
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - projected, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-surface-border rounded-full">
          <button
            className="h-10 w-10 flex items-center justify-center"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button
            className="h-10 w-10 flex items-center justify-center"
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
        </div>
        {outOfStock ? (
          <span className="text-sm text-muted">Agotado temporalmente</span>
        ) : stock <= 5 ? (
          <span className="text-sm text-rose-300">¡Solo quedan {stock} unidades!</span>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn-primary flex-1 disabled:opacity-40 disabled:pointer-events-none"
        >
          {added ? "¡Agregado!" : "Agregar al carrito"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="btn-secondary flex-1 disabled:opacity-40 disabled:pointer-events-none"
        >
          Comprar ahora
        </button>
      </div>

      {remaining > 0 ? (
        <p className="text-xs text-muted">
          Añade {formatCOP(remaining)} más a tu carrito y obtén envío gratis.
        </p>
      ) : (
        <p className="text-xs text-rose-300">Este pedido ya califica para envío gratis 🎉</p>
      )}
    </div>
  );
}
