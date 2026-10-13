"use client";

import { useEffect } from "react";
import { fbTrack } from "@/lib/metaPixel";

export default function ProductViewTracker({
  productId,
  name,
  price,
}: {
  productId: string;
  name: string;
  price: number;
}) {
  useEffect(() => {
    fbTrack("ViewContent", {
      content_ids: [productId],
      content_name: name,
      content_type: "product",
      value: price,
      currency: "COP",
    });
    // Solo nos interesa disparar una vez al montar la ficha de producto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return null;
}
