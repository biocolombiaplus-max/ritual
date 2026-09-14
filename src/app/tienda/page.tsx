import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; featured?: string; q?: string }>;
}) {
  const { categoria, featured, q } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        ...(categoria ? { category: { slug: categoria } } : {}),
        ...(featured ? { featured: true } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
      },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { position: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl">Tienda</h1>
        <p className="text-muted text-sm mt-2">
          {products.length} producto{products.length !== 1 ? "s" : ""} disponible{products.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/tienda"
          className={`px-4 py-2 rounded-full text-sm border ${
            !categoria ? "border-rose-400 text-rose-300" : "border-surface-border text-muted"
          }`}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/tienda?categoria=${c.slug}`}
            className={`px-4 py-2 rounded-full text-sm border ${
              categoria === c.slug ? "border-rose-400 text-rose-300" : "border-surface-border text-muted"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <form className="mb-8 max-w-sm" action="/tienda" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar productos..."
          className="input"
        />
      </form>

      {products.length === 0 ? (
        <p className="text-muted text-sm py-16 text-center">
          No se encontraron productos con esos filtros.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
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
    </div>
  );
}
