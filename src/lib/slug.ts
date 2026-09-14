import slugify from "slugify";
import { prisma } from "./prisma";

export async function uniqueProductSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true, locale: "es" }) || "producto";
  let slug = base;
  let i = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${i++}`;
  }
}
