"use client";

import { formatCOP, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import ShippingCalculator from "@/components/ShippingCalculator";

export default function EnviosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14">
      <h1 className="font-display text-3xl sm:text-4xl mb-4">Envíos y cobertura</h1>
      <p className="text-muted mb-10">
        Enviamos a los 32 departamentos de Colombia con empaque 100%
        discreto, sin logos ni referencias al contenido. Compras superiores a{" "}
        <span className="text-rose-300 font-medium">{formatCOP(FREE_SHIPPING_THRESHOLD)}</span> tienen envío gratis.
      </p>

      <div className="card p-6 mb-10">
        <h2 className="font-display text-xl mb-4">Cotiza tu envío</h2>
        <ShippingCalculator />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 text-sm text-muted">
        <div className="card p-5">
          <h3 className="text-foreground font-medium mb-2">Empaque discreto</h3>
          <p>Tu pedido llega en caja o bolsa neutra, sin ningún distintivo de la tienda ni del producto.</p>
        </div>
        <div className="card p-5">
          <h3 className="text-foreground font-medium mb-2">Cobertura nacional</h3>
          <p>Trabajamos con transportadoras de amplia cobertura como Interrapidísimo y Servientrega para llegar a cualquier municipio.</p>
        </div>
        <div className="card p-5">
          <h3 className="text-foreground font-medium mb-2">Tiempos de entrega</h3>
          <p>Entre 1 y 8 días hábiles según la ciudad de destino. Verás el estimado exacto en el cotizador.</p>
        </div>
        <div className="card p-5">
          <h3 className="text-foreground font-medium mb-2">Envío gratis</h3>
          <p>Automático en el checkout para pedidos superiores a {formatCOP(FREE_SHIPPING_THRESHOLD)}, sin códigos ni condiciones extra.</p>
        </div>
      </div>
    </div>
  );
}
