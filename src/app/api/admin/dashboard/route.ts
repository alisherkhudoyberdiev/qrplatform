// Admin: dashboard stats (today orders, revenue, latest orders)
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayOrders, allOrders, latestOrders] = await Promise.all([
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
    const orderTotal = order.items.reduce(
      (s, i) => s + i.menuItem.price * i.quantity,
      0
    );
    return sum + orderTotal;
  }, 0);

  return NextResponse.json({
    todayOrderCount: todayOrders,
    totalRevenue,
    latestOrders: latestOrders.map((o) => ({
      id: o.id,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items,
      total: o.items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0),
    })),
  });
}
