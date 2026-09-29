import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, activeCount, orderCount, orders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const revenue = await prisma.order.aggregate({ _sum: { total: true } });

  const cards = [
    { label: "Productos", value: productCount, href: "/admin/productos" },
    { label: "Productos activos", value: activeCount, href: "/admin/productos" },
    { label: "Pedidos recibidos", value: orderCount, href: "/admin/pedidos" },
    { label: "Ventas totales", value: formatCOP(revenue._sum.total ?? 0), href: "/admin/pedidos" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Dashboard</h1>

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
