import { prisma } from "./prisma";

// Métricas propias de la tienda (sin servicios externos) para el panel de
// analítica: embudo visitantes → agregó al carrito → inició checkout →
// compró, páginas más vistas y visitantes por día.

export interface FunnelStats {
  pageViews: number;
  visitors: number;
  addedToCart: number;
  beganCheckout: number;
  purchased: number;
  topPages: { path: string; views: number }[];
  daily: { day: string; visitors: number }[];
}

const EMPTY: FunnelStats = {
  pageViews: 0,
  visitors: 0,
  addedToCart: 0,
  beganCheckout: 0,
  purchased: 0,
  topPages: [],
  daily: [],
};

export async function getFunnelStats(days = 30): Promise<FunnelStats> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [pageViews, visitorsRows, addToCartRows, checkoutRows, purchased, topPagesRaw, dailyRaw] =
      await Promise.all([
        prisma.analyticsEvent.count({ where: { type: "page_view", createdAt: { gte: since } } }),
        prisma.analyticsEvent.findMany({
          where: { type: "page_view", createdAt: { gte: since } },
          select: { sessionId: true },
          distinct: ["sessionId"],
        }),
        prisma.analyticsEvent.findMany({
          where: { type: "add_to_cart", createdAt: { gte: since } },
          select: { sessionId: true },
          distinct: ["sessionId"],
        }),
        prisma.analyticsEvent.findMany({
          where: { type: "begin_checkout", createdAt: { gte: since } },
          select: { sessionId: true },
          distinct: ["sessionId"],
        }),
        prisma.analyticsEvent.count({ where: { type: "purchase", createdAt: { gte: since } } }),
        prisma.analyticsEvent.groupBy({
          by: ["path"],
          where: { type: "page_view", createdAt: { gte: since }, path: { not: null } },
          _count: { path: true },
          orderBy: { _count: { path: "desc" } },
          take: 6,
        }),
        prisma.$queryRaw<{ day: Date; visitors: bigint }[]>`
          SELECT date_trunc('day', "createdAt") as day, COUNT(DISTINCT "sessionId") as visitors
          FROM "AnalyticsEvent"
          WHERE type = 'page_view' AND "createdAt" >= ${since}
          GROUP BY day ORDER BY day ASC
        `,
      ]);

    return {
      pageViews,
      visitors: visitorsRows.length,
      addedToCart: addToCartRows.length,
      beganCheckout: checkoutRows.length,
      purchased,
      topPages: topPagesRaw.map((r) => ({ path: r.path as string, views: r._count.path })),
      daily: dailyRaw.map((r) => ({ day: r.day.toISOString().slice(0, 10), visitors: Number(r.visitors) })),
    };
  } catch {
    return EMPTY;
  }
}
