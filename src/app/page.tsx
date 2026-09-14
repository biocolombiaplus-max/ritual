import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import PaymentLogos from "@/components/PaymentLogos";
import { formatCOP, FREE_SHIPPING_THRESHOLD } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [featured, categories, hero, banner] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.category.findMany({ orderBy: { position: "asc" }, include: { _count: { select: { products: true } } } }),
    prisma.siteSection.findUnique({ where: { key: "hero" } }),
    prisma.siteSection.findUnique({ where: { key: "banner_promo" } }),
  ]);
  return { featured, categories, hero, banner };
}

export default async function Home() {
  const { featured, categories, hero, banner } = await getHomeData();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-surface-border">
        <div className="absolute inset-0">
          {hero?.imageUrl ? (
            <Image src={hero.imageUrl} alt={hero.title ?? "Ritual"} fill priority className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1c1620] via-[#120f13] to-[#1c1620]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-28 sm:py-36 text-center flex flex-col items-center">
          <span className="text-xs tracking-[0.3em] text-rose-300 uppercase mb-4">
            Bienestar &amp; placer premium
          </span>
          <h1 className="font-display text-4xl sm:text-6xl max-w-3xl leading-tight">
            {hero?.title ?? "Descubre tu ritual, vive tu placer"}
          </h1>
          <p className="text-muted mt-5 max-w-xl">
            {hero?.subtitle ??
              "La colección de bienestar íntimo más exclusiva de Colombia. Calidad premium, empaque 100% discreto y envío a todo el país."}
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href={hero?.linkUrl ?? "/tienda"} className="btn-primary">
              {hero?.linkText ?? "Explorar la tienda"}
            </Link>
            <Link href="/envios" className="btn-secondary">
              Cotizar mi envío
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-surface-border bg-background-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { title: "Envío discreto", desc: "Sin logos en el empaque" },
            { title: `Gratis desde ${formatCOP(FREE_SHIPPING_THRESHOLD)}`, desc: "A todo Colombia" },
            { title: "Pago 100% seguro", desc: "Tarjetas, PSE y contraentrega" },
            { title: "Calidad premium", desc: "Materiales certificados" },
          ].map((b) => (
            <div key={b.title}>
              <p className="text-sm font-semibold text-rose-300">{b.title}</p>
              <p className="text-xs text-muted mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <h2 className="font-display text-2xl sm:text-3xl mb-8">Compra por categoría</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/tienda?categoria=${c.slug}`}
                className="card p-5 text-center hover:border-rose-400 transition-colors"
              >
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-muted mt-1">{c._count.products} productos</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl">Los favoritos de la casa</h2>
          <Link href="/tienda" className="text-sm text-rose-300 hover:underline">
            Ver todo
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-muted text-sm">
            Aún no hay productos destacados. Agrega productos desde el panel administrativo en{" "}
            <Link href="/admin" className="text-rose-300 underline">/admin</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  slug: p.slug,
                  name: p.name,
                  price: p.price,
                  compareAtPrice: p.compareAtPrice,
                  image: p.images[0]?.url ?? null,
                  category: p.category?.name,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Promo banner */}
      <section className="relative overflow-hidden border-y border-surface-border">
        <div className="absolute inset-0">
          {banner?.imageUrl ? (
            <Image src={banner.imageUrl} alt={banner.title ?? "Promo"} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-[#2a1f24] to-[#171217]" />
          )}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 text-center">
          <h3 className="font-display text-2xl sm:text-3xl mb-3">
            {banner?.title ?? "Agrega un producto más y obtén envío gratis"}
          </h3>
          <p className="text-muted max-w-xl mx-auto mb-6">
            {banner?.subtitle ??
              `Compras superiores a ${formatCOP(FREE_SHIPPING_THRESHOLD)} tienen envío gratis a cualquier ciudad de Colombia.`}
          </p>
          <Link href={banner?.linkUrl ?? "/tienda"} className="btn-primary">
            {banner?.linkText ?? "Seguir comprando"}
          </Link>
        </div>
      </section>

      {/* Payment methods */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 text-center">
        <p className="text-sm text-muted mb-4">Paga como prefieras, de forma 100% segura</p>
        <div className="flex justify-center">
          <PaymentLogos />
        </div>
      </section>
    </div>
  );
}
