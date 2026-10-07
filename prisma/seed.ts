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
      linkText: "Ver catálogo",
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

  await prisma.siteSection.upsert({
    where: { key: "brand_story" },
    update: {},
    create: {
      key: "brand_story",
      title: "El placer también se cultiva",
      subtitle:
        "En Ritual.com creemos que el bienestar íntimo merece el mismo cuidado que cualquier otro ritual de tu vida. Seleccionamos cada pieza pensando en tu piel, tu privacidad y tu placer — sin prejuicios, sin apuros y sin que nadie más tenga por qué saberlo.",
      imageUrl: "/seed/brand-story.svg",
      linkUrl: "/tienda",
      linkText: "Conoce la colección",
    },
  });

  await prisma.siteSection.upsert({
    where: { key: "newsletter" },
    update: {},
    create: {
      key: "newsletter",
      title: "Únete y recibe 10% en tu primera compra",
      subtitle: "Sé la primera persona en enterarte de lanzamientos y ofertas exclusivas. 100% privado, cero spam.",
    },
  });

  console.log("Configurando contenido de inicio...");
  await prisma.contentItem.deleteMany();

  const BENEFITS = [
    { title: "Envío discreto", subtitle: "Sin logos en el empaque" },
    { title: "Gratis desde $198.000", subtitle: "A todo Colombia" },
    { title: "Pago 100% seguro", subtitle: "Tarjetas, PSE y contraentrega" },
    { title: "Calidad premium", subtitle: "Materiales certificados" },
  ];
  for (const [i, b] of BENEFITS.entries()) {
    await prisma.contentItem.create({ data: { group: "benefit", position: i, ...b } });
  }

  const PROCESS = [
    { icon: "🛍️", title: "Elige con total privacidad", body: "Explora el catálogo sin registro obligatorio. Tu historial de compra es solo tuyo." },
    { icon: "📦", title: "Empacamos con discreción", body: "Caja o bolsa neutra, sin logos ni referencias al contenido. Ni la transportadora lo sabe." },
    { icon: "💳", title: "Pagas como prefieras", body: "Tarjeta, PSE, Nequi, Bancolombia o contraentrega — lo que te quede más cómodo." },
    { icon: "🚚", title: "Recíbelo donde estés", body: "Entrega en cualquier ciudad de Colombia, directo en la puerta de tu casa." },
  ];
  for (const [i, p] of PROCESS.entries()) {
    await prisma.contentItem.create({ data: { group: "process", position: i, ...p } });
  }

  const TESTIMONIALS = [
    { title: "Valentina R.", subtitle: "Bogotá", rating: 5, body: "Pedí sin miedo de que alguien se enterara y llegó en una caja totalmente neutra. Superó mis expectativas." },
    { title: "Camilo M.", subtitle: "Medellín", rating: 5, body: "La calidad es justo la que prometen, nada de imitación barata. Y llegó en dos días a mi casa." },
    { title: "Laura P.", subtitle: "Cali", rating: 5, body: "El servicio por WhatsApp fue muy amable y resolvieron todas mis dudas sin juzgar nada. Repito seguro." },
  ];
  for (const [i, t] of TESTIMONIALS.entries()) {
    await prisma.contentItem.create({ data: { group: "testimonial", position: i, ...t } });
  }

  const EDUCATION = [
    { icon: "🎯", title: "Cómo elegir tu primer producto", body: "Material, intensidad y tamaño son las tres variables clave. Si es tu primera vez, parte por algo pequeño y versátil antes de ir a opciones más intensas." },
    { icon: "🧼", title: "Cuidado e higiene correctos", body: "Limpia con jabón neutro o limpiador específico antes y después de cada uso, y guarda en un lugar seco, lejos de la luz directa, para que dure mucho más." },
    { icon: "💧", title: "Lubricantes: cuál elegir", body: "Los de base acuosa son compatibles con todos los materiales; los de silicona duran más pero no se usan con juguetes de silicona. Siempre sin perfume si tu piel es sensible." },
    { icon: "💬", title: "Comunicación en pareja", body: "Hablar antes sobre gustos y límites hace toda la diferencia. El bienestar íntimo también se construye con confianza y buena comunicación." },
  ];
  for (const [i, e] of EDUCATION.entries()) {
    await prisma.contentItem.create({ data: { group: "education", position: i, ...e } });
  }

  console.log("Configurando tarifa de envío local (Medellín)...");
  await prisma.shippingRate.deleteMany();
  await prisma.shippingRate.create({
    data: {
      department: "Antioquia",
      city: "Medellín",
      cost: 8900,
      etaLabel: null, // la regla de "mismo día antes de las 3pm" se calcula automáticamente
      active: true,
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
