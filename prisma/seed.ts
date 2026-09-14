import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

interface SeedProduct {
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  featured?: boolean;
  images: string[];
}

interface SeedCategory {
  name: string;
  folder: string;
  products: SeedProduct[];
}

const CATEGORIES: SeedCategory[] = [
  {
    name: "Vibradores",
    folder: "vibradores",
    products: [
      {
        name: "Vibrador Silk Touch",
        shortDescription: "Silicona premium ultra suave con 10 modos de vibración",
        description:
          "Vibrador de silicona médica hipoalergénica, 100% sumergible y recargable por USB. Cuenta con 10 modos de vibración e intensidad ajustable para una experiencia totalmente personalizable. Motor silencioso de alto rendimiento.",
        price: 129900,
        compareAtPrice: 169900,
        stock: 24,
        featured: true,
        images: ["vibradores-1.svg", "vibradores-2.svg"],
      },
      {
        name: "Vibrador Bala Discreta Pro",
        shortDescription: "Compacto, potente y perfecto para llevar a cualquier lugar",
        description:
          "Diseño compacto y discreto con potencia sorprendente. Ideal para principiantes y para uso en pareja. Batería de larga duración y carga magnética rápida.",
        price: 79900,
        stock: 40,
        featured: true,
        images: ["vibradores-2.svg"],
      },
      {
        name: "Vibrador Dual Pulse",
        shortDescription: "Estimulación doble con control remoto incluido",
        description:
          "Diseño ergonómico con doble motor para estimulación simultánea. Incluye control remoto inalámbrico y modo silencioso para mayor privacidad.",
        price: 159900,
        compareAtPrice: 199900,
        stock: 12,
        images: ["vibradores-1.svg"],
      },
    ],
  },
  {
    name: "Lubricantes y Aceites",
    folder: "lubricantes-y-aceites",
    products: [
      {
        name: "Aceite de Masaje Sensual 100ml",
        shortDescription: "Fórmula comestible sabor fresa, no pegajosa",
        description:
          "Aceite de masaje comestible a base de ingredientes naturales. Textura sedosa, no pegajosa, compatible con preservativos de látex. Ideal para preludios y masajes de pareja.",
        price: 49900,
        stock: 60,
        featured: true,
        images: ["lubricantes-y-aceites-1.svg"],
      },
      {
        name: "Lubricante Base Agua Hidratante 150ml",
        shortDescription: "Larga duración, fácil de limpiar, apto para juguetes",
        description:
          "Lubricante íntimo a base de agua, hipoalergénico y compatible con todo tipo de juguetes y preservativos. Fórmula de larga duración que no reseca.",
        price: 39900,
        stock: 80,
        images: ["lubricantes-y-aceites-2.svg"],
      },
      {
        name: "Lubricante Efecto Calor 100ml",
        shortDescription: "Sensación de calidez progresiva",
        description:
          "Fórmula especial que genera una sensación de calidez progresiva al contacto con la piel. Textura suave, base agua, fácil de remover.",
        price: 44900,
        stock: 45,
        images: ["lubricantes-y-aceites-1.svg"],
      },
    ],
  },
  {
    name: "Juguetes de Pareja",
    folder: "juguetes-de-pareja",
    products: [
      {
        name: "Anillo Vibrador para Pareja",
        shortDescription: "Estimulación compartida, silicona suave y flexible",
        description:
          "Anillo vibrador de silicona flexible diseñado para el disfrute en pareja. Varios modos de vibración, resistente al agua y fácil de limpiar.",
        price: 69900,
        stock: 30,
        featured: true,
        images: ["juguetes-de-pareja-1.svg"],
      },
      {
        name: "Kit Sensorial de Pareja",
        shortDescription: "Pluma, venda y accesorios para nuevas experiencias",
        description:
          "Set de accesorios sensoriales para explorar nuevas experiencias en pareja: pluma de plumas naturales, venda de satín y dados de posiciones.",
        price: 89900,
        compareAtPrice: 109900,
        stock: 18,
        images: ["juguetes-de-pareja-2.svg"],
      },
    ],
  },
  {
    name: "Bienestar Femenino",
    folder: "bienestar-femenino",
    products: [
      {
        name: "Estimulador de Succión Suave",
        shortDescription: "Tecnología de ondas de aire, silencioso",
        description:
          "Estimulador con tecnología de ondas de presión de aire para una sensación envolvente y suave. 8 intensidades, cuerpo de silicona premium.",
        price: 149900,
        compareAtPrice: 189900,
        stock: 20,
        featured: true,
        images: ["bienestar-femenino-1.svg"],
      },
      {
        name: "Set de Bolas Chinas Graduales",
        shortDescription: "Entrenamiento de suelo pélvico, 3 pesos",
        description:
          "Set progresivo de bolas de silicona para fortalecimiento del suelo pélvico. Incluye tres pesos distintos y cordón de extracción de silicona.",
        price: 69900,
        stock: 35,
        images: ["bienestar-femenino-2.svg"],
      },
    ],
  },
  {
    name: "Bienestar Masculino",
    folder: "bienestar-masculino",
    products: [
      {
        name: "Masturbador Textura Premium",
        shortDescription: "Silicona TPE ultra realista, fácil de limpiar",
        description:
          "Manga de silicona TPE con textura interna diseñada para máximo confort. Discreta, fácil de limpiar y reutilizable.",
        price: 99900,
        stock: 25,
        featured: true,
        images: ["bienestar-masculino-1.svg"],
      },
      {
        name: "Anillo de Silicona Ajustable x3",
        shortDescription: "Set de tres tallas, cómodo y flexible",
        description:
          "Set de tres anillos de silicona en distintas tallas, flexibles, cómodos e hipoalergénicos.",
        price: 34900,
        stock: 50,
        images: ["bienestar-masculino-2.svg"],
      },
    ],
  },
  {
    name: "Bondage y Accesorios",
    folder: "bondage-y-accesorios",
    products: [
      {
        name: "Set de Esposas de Cuero Acolchadas",
        shortDescription: "Cierre de seguridad rápido, ajuste universal",
        description:
          "Esposas de cuero sintético con acolchado interno para mayor comodidad. Cierre de seguridad de liberación rápida y ajuste universal.",
        price: 79900,
        compareAtPrice: 99900,
        stock: 22,
        images: ["bondage-y-accesorios-1.svg"],
      },
      {
        name: "Antifaz de Satín Premium",
        shortDescription: "Tela suave, ajuste cómodo, 100% opaco",
        description:
          "Antifaz elaborado en satín suave con elástico ajustable. Bloqueo total de luz para una experiencia sensorial completa.",
        price: 29900,
        stock: 45,
        images: ["bondage-y-accesorios-2.svg"],
      },
    ],
  },
  {
    name: "Lenceria",
    folder: "lenceria",
    products: [
      {
        name: "Conjunto Encaje Noche Rosa",
        shortDescription: "Encaje floral, tallas S a XL",
        description:
          "Conjunto de dos piezas en encaje floral con detalles en cinta de satín. Disponible en tallas S a XL. Tela suave y transpirable.",
        price: 89900,
        stock: 28,
        featured: true,
        images: ["lenceria-1.svg"],
      },
      {
        name: "Babydoll Transparencias",
        shortDescription: "Silueta favorecedora, tirantes ajustables",
        description:
          "Babydoll semitransparente con tirantes ajustables y acabado en encaje. Diseño favorecedor para todo tipo de cuerpo.",
        price: 74900,
        compareAtPrice: 94900,
        stock: 20,
        images: ["lenceria-2.svg"],
      },
    ],
  },
];

async function main() {
  console.log("Limpiando datos existentes...");
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("Creando categorías y productos...");
  let position = 0;
  for (const cat of CATEGORIES) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: slugify(cat.name, { lower: true, strict: true, locale: "es" }),
        position: position++,
      },
    });

    for (const p of cat.products) {
      const baseSlug = slugify(p.name, { lower: true, strict: true, locale: "es" });
      await prisma.product.create({
        data: {
          slug: baseSlug,
          name: p.name,
          shortDescription: p.shortDescription,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          stock: p.stock,
          featured: !!p.featured,
          categoryId: category.id,
          images: {
            create: p.images.map((img, i) => ({ url: `/seed/${img}`, position: i })),
          },
        },
      });
    }
  }

  console.log("Configurando secciones de inicio...");
  await prisma.siteSection.upsert({
    where: { key: "hero" },
    update: {},
    create: {
      key: "hero",
      title: "Descubre tu ritual, vive tu placer",
      subtitle:
        "La colección de bienestar íntimo más exclusiva de Colombia. Calidad premium, empaque 100% discreto y envío a todo el país.",
      imageUrl: "/seed/hero.svg",
      linkUrl: "/tienda",
      linkText: "Explorar la tienda",
    },
  });

  await prisma.siteSection.upsert({
    where: { key: "banner_promo" },
    update: {},
    create: {
      key: "banner_promo",
      title: "Agrega un producto más y obtén envío gratis",
      subtitle: "Compras superiores a $198.000 tienen envío gratis a cualquier ciudad de Colombia.",
      imageUrl: "/seed/banner.svg",
      linkUrl: "/tienda",
      linkText: "Seguir comprando",
    },
  });

  console.log("Listo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
