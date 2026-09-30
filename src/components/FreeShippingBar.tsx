"use client";

import { formatCOP, FREE_SHIPPING_THRESHOLD } from "@/lib/format";

export default function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const pct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const achieved = remaining === 0;

  return (
    <div>
      <p className="text-sm mb-2 flex items-center gap-1.5">
        {achieved ? (
          <span className="text-rose-300 font-medium flex items-center gap-1.5">
            🎁 ¡Tu pedido ya tiene envío gratis!
          </span>
        ) : (
          <>
            <span>🚚 Te faltan</span>
            <span className="text-rose-300 font-semibold">{formatCOP(remaining)}</span>
            <span>para <span className="font-semibold">envío gratis</span></span>
          </>
        )}
      </p>
      <div className="relative h-2.5 w-full rounded-full bg-surface-border overflow-hidden">
        <div
          className="h-full bg-gradient-rose transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-muted">
        <span>$0</span>
        <span className={achieved ? "text-rose-300 font-semibold" : ""}>
          {formatCOP(FREE_SHIPPING_THRESHOLD)} 🎁
        </span>
      </div>
    </div>
  );
}
