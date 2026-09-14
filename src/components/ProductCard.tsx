import Link from "next/link";
import Image from "next/image";
import { formatCOP } from "@/lib/format";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  image: string | null;
  category?: string | null;
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(
        (1 - product.price / (product.compareAtPrice as number)) * 100
      )
    : 0;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group card overflow-hidden flex flex-col transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-square bg-background-soft overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted text-sm">
            Ritual.com
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 rounded-full bg-gradient-rose text-[#1a1216] text-xs font-bold px-2.5 py-1">
            -{discountPct}%
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        {product.category && (
          <span className="text-[11px] uppercase tracking-wide text-muted">
            {product.category}
          </span>
        )}
        <h3 className="font-medium text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <span className="font-display text-lg text-rose-300">
            {formatCOP(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted line-through">
              {formatCOP(product.compareAtPrice as number)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
