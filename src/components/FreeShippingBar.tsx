"use client";

import { formatCOP, FREE_SHIPPING_THRESHOLD } from "@/lib/format";

export default function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const pct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const achieved = remaining === 0;

  return (
    <div>
      <p className="text-sm mb-2">
        {achieved ? (
          <span className="text-rose-300 font-medium">
            ¡Felicidades! Tu pedido tiene envío gratis 🎉
          </span>
        ) : (
          <>
            Te faltan{" "}
            <span className="text-rose-300 font-semibold">
              {formatCOP(remaining)}
            </span>{" "}
            para obtener <span className="font-semibold">envío gratis</span>
          </>
        )}
      </p>
      <div className="h-2 w-full rounded-full bg-surface-border overflow-hidden">
        <div
          className="h-full bg-gradient-rose transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
