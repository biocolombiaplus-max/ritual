import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import PaymentLogos from "@/components/PaymentLogos";
import NewsletterForm from "@/components/NewsletterForm";
import { formatCOP, FREE_SHIPPING_THRESHOLD } from "@/lib/format";

export const dynamic = "force-dynamic";

const DEFAULT_BENEFITS = [
  { title: "Envío discreto", subtitle: "Sin logos en el empaque" },
  { title: `Gratis desde ${formatCOP(FREE_SHIPPING_THRESHOLD)}`, subtitle: "A todo Colombia" },
  { title: "Pago 100% seguro", subtitle: "Tarjetas, PSE y contraentrega" },
  { title: "Calidad premium", subtitle: "Materiales certificados" },
];

const DEFAULT_PROCESS = [
  { icon: "🛍️", title: "Elige con total privacidad", body: "Explora el catálogo sin registro obligatorio. Tu historial de compra es solo tuyo." },
  { icon: "📦", title: "Empacamos con discreción", body: "Caja o bolsa neutra, sin logos ni referencias al contenido. Ni la transportadora lo sabe." },
  { icon: "💳", title: "Pagas como prefieras", body: "Tarjeta, PSE, Nequi, Bancolombia o contraentrega — lo que te quede más cómodo." },
  { icon: "🚚", title: "Recíbelo donde estés", body: "Entrega en cualquier ciudad de Colombia, directo en la puerta de tu casa." },
];

const DEFAULT_TESTIMONIALS = [
  { title: "Valentina R.", subtitle: "Bogotá", rating: 5, body: "Pedí sin miedo de que alguien se enterara y llegó en una caja totalmente neutra. Superó mis expectativas." },
  { title: "Camilo M.", subtitle: "Medellín", rating: 5, body: "La calidad es justo la que prometen, nada de imitación barata. Y llegó en dos días a mi casa." },
  { title: "Laura P.", subtitle: "Cali", rating: 5, body: "El servicio por WhatsApp fue muy amable y resolvieron todas mis dudas sin juzgar nada. Repito seguro." },
];

async function getHomeData() {
  const [featured, newArrivals, categories, hero, banner, brandStory, newsletter, benefits, process, testimonials] =
    await Promise.all([
      prisma.product.findMany({
        where: { active: true, featured: true },
        include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { active: true },
        include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.category.findMany({ orderBy: { position: "asc" }, include: { _count: { select: { products: true } } } }),
      prisma.siteSection.findUnique({ where: { key: "hero" } }),
      prisma.siteSection.findUnique({ where: { key: "banner_promo" } }),
      prisma.siteSection.findUnique({ where: { key: "brand_story" } }),
      prisma.siteSection.findUnique({ where: { key: "newsletter" } }),
      prisma.contentItem.findMany({ where: { group: "benefit", active: true }, orderBy: { position: "asc" } }),
      prisma.contentItem.findMany({ where: { group: "process", active: true }, orderBy: { position: "asc" } }),
      prisma.contentItem.findMany({ where: { group: "testimonial", active: true }, orderBy: { position: "asc" } }),
    ]);
  return { featured, newArrivals, categories, hero, banner, brandStory, newsletter, benefits, process, testimonials };
}

export default async function Home() {
  const {
    featured,
    newArrivals,
    categories,
    hero,
    banner,
    brandStory,
    newsletter,
    benefits,
    process,
    testimonials,
  } = await getHomeData();

  const benefitItems = benefits.length > 0 ? benefits : DEFAULT_BENEFITS;
  const processItems = process.length > 0 ? process : DEFAULT_PROCESS;
  const testimonialItems = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;

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

      {/* Benefits bar */}
      <section className="border-b border-surface-border bg-background-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {benefitItems.map((b, i) => (
            <div key={"id" in b ? b.id : i}>
              <p className="text-sm font-semibold text-rose-300">{b.title}</p>
              <p className="text-xs text-muted mt-1">{b.subtitle}</p>
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

      {/* Cómo funciona */}
      <section className="bg-background-soft border-y border-surface-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs tracking-[0.3em] text-rose-300 uppercase">Sin sorpresas, sin pena</span>
            <h2 className="font-display text-2xl sm:text-3xl mt-3">Así de simple es tu pedido discreto</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processItems.map((p, i) => (
              <div key={"id" in p ? p.id : i} className="relative card p-6 text-center">
                <span className="absolute -top-3 -left-3 h-7 w-7 rounded-full bg-gradient-rose text-[#1a1216] text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="text-3xl mb-3">{p.icon ?? "✨"}</div>
                <h3 className="font-medium mb-2">{p.title}</h3>
                <p className="text-sm text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
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

      {/* Nuestra filosofía / brand story */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden card order-2 md:order-1">
            {brandStory?.imageUrl ? (
              <Image src={brandStory.imageUrl} alt={brandStory.title ?? "Ritual.com"} fill className="object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#2a1f24] to-[#171217] flex items-center justify-center text-muted">
                Ritual.com
              </div>
            )}
          </div>
          <div className="order-1 md:order-2">
            <span className="text-xs tracking-[0.3em] text-rose-300 uppercase">Nuestra filosofía</span>
            <h2 className="font-display text-2xl sm:text-3xl mt-3 mb-4">
              {brandStory?.title ?? "El placer también se cultiva"}
            </h2>
            <p className="text-muted leading-relaxed">
              {brandStory?.subtitle ??
                "En Ritual.com creemos que el bienestar íntimo merece el mismo cuidado que cualquier otro ritual de tu vida. Seleccionamos cada pieza pensando en tu piel, tu privacidad y tu placer — sin prejuicios, sin apuros y sin que nadie más tenga por qué saberlo."}
            </p>
            <Link href={brandStory?.linkUrl ?? "/tienda"} className="btn-secondary mt-6 inline-flex">
              {brandStory?.linkText ?? "Conoce la colección"}
            </Link>
          </div>
        </div>
      </section>

      {/* Recién llegados */}
      {newArrivals.length > 0 && (
        <section className="bg-background-soft border-y border-surface-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs tracking-[0.3em] text-rose-300 uppercase">Novedades</span>
                <h2 className="font-display text-2xl sm:text-3xl mt-2">Recién llegados</h2>
              </div>
              <Link href="/tienda" className="text-sm text-rose-300 hover:underline">
                Ver todo
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((p) => (
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
          </div>
        </section>
      )}

      {/* Testimonios */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs tracking-[0.3em] text-rose-300 uppercase">Lo que dicen de nosotros</span>
          <h2 className="font-display text-2xl sm:text-3xl mt-3">Miles ya viven su ritual</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonialItems.map((t, i) => (
            <div key={"id" in t ? t.id : i} className="card p-6">
              <div className="text-rose-300 text-sm mb-3">{"★".repeat(t.rating ?? 5)}</div>
              <p className="text-sm leading-relaxed mb-4">&ldquo;{t.body}&rdquo;</p>
              <p className="text-sm font-medium">{t.title}</p>
              {t.subtitle && <p className="text-xs text-muted">{t.subtitle}</p>}
            </div>
          ))}
        </div>
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

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 text-center">
        <span className="text-xs tracking-[0.3em] text-rose-300 uppercase">Círculo Ritual</span>
        <h2 className="font-display text-2xl sm:text-3xl mt-3 mb-3">
          {newsletter?.title ?? "Únete y recibe 10% en tu primera compra"}
        </h2>
        <p className="text-muted max-w-xl mx-auto mb-8">
          {newsletter?.subtitle ??
            "Sé la primera persona en enterarte de lanzamientos y ofertas exclusivas. 100% privado, cero spam."}
        </p>
        <NewsletterForm />
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
