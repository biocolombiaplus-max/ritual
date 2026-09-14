import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Editar producto</h1>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          shortDescription: product.shortDescription ?? "",
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? "",
          sku: product.sku ?? "",
          stock: product.stock,
          weightGrams: product.weightGrams,
          categoryId: product.categoryId ?? "",
          featured: product.featured,
          active: product.active,
          images: product.images.map((i) => i.url),
        }}
      />
    </div>
  );
}
