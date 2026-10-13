"use client";

import { useEffect } from "react";
import { fbTrack } from "@/lib/metaPixel";

export default function PurchaseTracker({ code, value }: { code: string; value: number }) {
  useEffect(() => {
    fbTrack("Purchase", { value, currency: "COP", content_ids: [code] });
    // Solo nos interesa disparar una vez al confirmar el pedido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return null;
}
