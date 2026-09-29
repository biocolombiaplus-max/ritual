import slugify from "slugify";
import { prisma } from "./prisma";

// Busca una categoría por nombre (sin distinguir mayúsculas) y la crea si
// no existe todavía — usado por la importación masiva y la carga rápida
// para no duplicar categorías cuando el admin escribe el mismo nombre con
// variaciones de mayúsculas/espacios.
export async function resolveCategoryId(categoryName: string | undefined | null): Promise<string | null> {
  const name = categoryName?.trim();
  if (!name) return null;

  const slug = slugify(name, { lower: true, strict: true, locale: "es" });
  const category = await prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug, position: await prisma.category.count() },
  });
  return category.id;
}
