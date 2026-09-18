import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format } from "date-fns";

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const sevenDaysAgoStart = startOfDay(subDays(now, 6));

  const [todayOrders, activeOrders, last7DaysOrders, topItemsRaw, recentOrders] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } },
      select: { total: true },
    }),
    prisma.order.count({
      where: { status: { in: ["PENDING", "PREPARING", "READY"] } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgoStart }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ["itemName"],
      where: { order: { createdAt: { gte: sevenDaysAgoStart }, status: { not: "CANCELLED" } } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 6,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true },
    }),
  ]);

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayOrderCount = todayOrders.length;
  const avgOrderValue = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0;

  const dayBuckets: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const key = format(subDays(now, i), "yyyy-MM-dd");
    dayBuckets[key] = 0;
  }
  for (const order of last7DaysOrders) {
    const key = format(order.createdAt, "yyyy-MM-dd");
    if (key in dayBuckets) dayBuckets[key] += order.total;
  }
  const revenueTrend = Object.entries(dayBuckets).map(([date, revenue]) => ({
    date,
    label: format(new Date(date), "EEE"),
    revenue: Math.round(revenue),
  }));

  const weekRevenue = last7DaysOrders.reduce((sum, o) => sum + o.total, 0);

  const topItems = topItemsRaw.map((t) => ({
    name: t.itemName,
    quantity: t._sum.quantity ?? 0,
    revenue: t._sum.subtotal ?? 0,
  }));

  return {
    todayRevenue,
    todayOrderCount,
    avgOrderValue,
    activeOrders,
    weekRevenue,
    revenueTrend,
    topItems,
    recentOrders,
  };
}
