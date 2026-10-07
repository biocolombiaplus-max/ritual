import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/format";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import ProductCard from "@/components/ProductCard";
import { getWhatsappNumber } from "@/lib/settings";
import { productMessage, waLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.active) return {};

  const description = product.shortDescription || product.description.slice(0, 155);
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      locale: "es_CO",
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.active) notFound();

  const related = await prisma.product.findMany({
    where: {
      active: true,
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
    take: 4,
  });

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const whatsapp = await getWhatsappNumber();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ritual.com";
  const whatsappHref = whatsapp
    ? waLink(whatsapp, productMessage({ name: product.name, price: product.price, slug: product.slug }, appUrl))
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <nav className="text-xs text-muted mb-6 flex gap-2">
        <Link href="/" className="hover:text-rose-300">Inicio</Link>
        <span>/</span>
        <Link href="/tienda" className="hover:text-rose-300">Tienda</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/tienda?categoria=${product.category.slug}`} className="hover:text-rose-300">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <ProductGallery images={product.images.map((i) => i.url)} name={product.name} />

        <div>
          {product.category && (
            <span className="text-xs uppercase tracking-wide text-rose-300">
              {product.category.name}
            </span>
          )}
          <h1 className="font-display text-3xl sm:text-4xl mt-2">{product.name}</h1>
          {product.shortDescription && (
            <p className="text-muted mt-3">{product.shortDescription}</p>
          )}

          <div className="flex items-baseline gap-3 mt-5">
            <span className="font-display text-3xl text-rose-300">
              {formatCOP(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-muted line-through">
                {formatCOP(product.compareAtPrice as number)}
              </span>
            )}
          </div>

          {lowStock && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
              ⚡ ¡Solo quedan {product.stock} unidades disponibles!
            </p>
          )}

          <div className="mt-6">
            <AddToCartPanel
              productId={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              image={product.images[0]?.url ?? null}
              stock={product.stock}
            />
          </div>

          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.07c-.24.68-1.4 1.3-1.93 1.37-.5.07-1.1.1-1.77-.11a16.3 16.3 0 0 1-1.58-.58c-2.78-1.2-4.6-4.02-4.74-4.2-.14-.19-1.14-1.51-1.14-2.88s.72-2.04.98-2.32c.26-.28.56-.35.75-.35h.54c.17 0 .4-.06.63.48.24.57.8 1.97.87 2.11.07.14.12.3.02.49-.1.19-.15.3-.29.47-.14.16-.3.36-.43.49-.14.14-.29.29-.12.57.17.28.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.33 1.44.28.14.44.12.6-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.64-.14.26.09 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
              </svg>
              Cierra tu compra por WhatsApp
            </a>
          )}

          <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs text-muted">
            <div className="card p-3">Envío discreto</div>
            <div className="card p-3">Pago seguro</div>
            <div className="card p-3">Calidad premium</div>
          </div>

          <div className="mt-8 prose-sm whitespace-pre-line text-sm text-muted leading-relaxed">
            <h2 className="font-display text-lg text-foreground mb-2">Descripción</h2>
            {product.description}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl mb-6">Combina bien con esto</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
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
        </section>
      )}
    </div>
  );
}
