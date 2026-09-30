import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/format";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import ProductCard from "@/components/ProductCard";

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
