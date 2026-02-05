// Server-only: dashboard data for admin (avoids internal API call)
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayOrderCount, allOrders, latestOrders] = await Promise.all([
    prisma.order.count({
      where: {
        restaurantId: session.restaurantId,
        createdAt: { gte: todayStart },
      },
    }),
    prisma.order.findMany({
      where: { restaurantId: session.restaurantId },
      include: { items: { include: { menuItem: true } } },
    }),
    prisma.order.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: { include: { menuItem: true } } },
    }),
  ]);

  const totalRevenue = allOrders.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0)
    );
  }, 0);

  // Top 3 selling items (by quantity ordered), with imageUrl for V3
  const itemCounts: Record<string, { name: string; quantity: number; imageUrl?: string | null }> = {};
  allOrders.forEach((order) => {
    order.items.forEach((oi) => {
      const id = oi.menuItem.id;
      if (!itemCounts[id]) {
        itemCounts[id] = {
          name: oi.menuItem.name,
          quantity: 0,
          imageUrl: oi.menuItem.imageUrl ?? null,
        };
      }
      itemCounts[id].quantity += oi.quantity;
    });
  });
  const topSelling = Object.entries(itemCounts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);

  return {
    todayOrderCount,
    totalRevenue,
    topSelling,
    latestOrders: latestOrders.map((o) => ({
      id: o.id,
      status: o.status,
      createdAt: o.createdAt,
      total: o.items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0),
    })),
  };
}
