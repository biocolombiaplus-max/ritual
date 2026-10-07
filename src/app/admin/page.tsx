import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/format";
import { getFunnelStats } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, activeCount, orderCount, orders, funnel] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    getFunnelStats(7),
  ]);

  const revenue = await prisma.order.aggregate({ _sum: { total: true } });
  const conversion = funnel.visitors > 0 ? Math.round((funnel.purchased / funnel.visitors) * 100) : 0;

  const cards = [
    { label: "Productos", value: productCount, href: "/admin/productos" },
    { label: "Productos activos", value: activeCount, href: "/admin/productos" },
    { label: "Pedidos recibidos", value: orderCount, href: "/admin/pedidos" },
    { label: "Ventas totales", value: formatCOP(revenue._sum.total ?? 0), href: "/admin/pedidos" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Dashboard</h1>

      <Link
        href="/admin/analitica"
        className="block card p-6 mb-6 border-emerald-400/30 bg-gradient-to-r from-emerald-400/10 via-rose-400/5 to-transparent hover:border-emerald-400/60 transition-colors"
      >
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h3 className="font-display text-lg">📊 Últimos 7 días</h3>
          <span className="text-xs font-semibold text-emerald-400">Ver analítica completa →</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Visitantes", value: funnel.visitors },
            { label: "Carrito", value: funnel.addedToCart },
            { label: "Checkout", value: funnel.beganCheckout },
            { label: "Compras", value: funnel.purchased },
            { label: "Conversión", value: `${conversion}%` },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xs text-muted">{s.label}</p>
              <p className="font-display text-xl mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </Link>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card p-5 hover:border-rose-400 transition-colors">
            <p className="text-xs text-muted">{c.label}</p>
            <p className="font-display text-2xl mt-1 text-rose-300">{c.value}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/admin/productos/carga-rapida"
        className="block card p-6 mb-6 border-rose-400/50 bg-gradient-to-r from-rose-400/10 to-transparent hover:border-rose-400 transition-colors"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display text-xl mb-1">⚡ Carga rápida de productos</h3>
            <p className="text-sm text-muted">
              Sube muchas fotos a la vez (por ejemplo, las que te llegan por WhatsApp), agrúpalas por producto y
              publica todo en minutos — con autocompletado por IA opcional.
            </p>
          </div>
          <span className="btn-primary shrink-0">Empezar</span>
        </div>
      </Link>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Link href="/admin/productos/nuevo" className="card p-6 hover:border-rose-400 transition-colors">
          <h3 className="font-display text-lg mb-1">Agregar producto</h3>
          <p className="text-sm text-muted">Crea un producto nuevo con imágenes, precio y stock.</p>
        </Link>
        <Link href="/admin/importar" className="card p-6 hover:border-rose-400 transition-colors">
          <h3 className="font-display text-lg mb-1">Importar catálogo</h3>
          <p className="text-sm text-muted">Sube un CSV/Excel o PDF y crea varios productos a la vez.</p>
        </Link>
        <Link href="/admin/secciones" className="card p-6 hover:border-rose-400 transition-colors">
          <h3 className="font-display text-lg mb-1">Editar página de inicio</h3>
          <p className="text-sm text-muted">Cambia las imágenes y textos del banner, la filosofía de marca y el newsletter.</p>
        </Link>
        <Link href="/admin/contenido" className="card p-6 hover:border-rose-400 transition-colors">
          <h3 className="font-display text-lg mb-1">Contenido de inicio</h3>
          <p className="text-sm text-muted">Beneficios, pasos de &ldquo;cómo funciona&rdquo; y testimonios de clientas/es.</p>
        </Link>
        <Link href="/admin/envios" className="card p-6 hover:border-rose-400 transition-colors">
          <h3 className="font-display text-lg mb-1">🚚 Envíos por zona</h3>
          <p className="text-sm text-muted">Fija tarifas por departamento o municipio y revisa la regla de mismo día en Medellín.</p>
        </Link>
        <Link href="/admin/pedidos" className="card p-6 hover:border-rose-400 transition-colors">
          <h3 className="font-display text-lg mb-1">Ver pedidos</h3>
          <p className="text-sm text-muted">Revisa los pedidos generados desde el checkout.</p>
        </Link>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-4">Últimos pedidos</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay pedidos.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="flex justify-between text-sm border-b border-surface-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{o.code}</p>
                  <p className="text-muted text-xs">{o.customerName} · {o.city}</p>
                </div>
                <p className="text-rose-300">{formatCOP(o.total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
