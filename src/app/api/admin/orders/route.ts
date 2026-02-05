// Admin: list orders (live, auto-refresh every 5s on client)
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { menuItem: true } },
    },
  });

  const ordersWithTotal = orders.map((o) => ({
    id: o.id,
    status: o.status,
    createdAt: o.createdAt,
    tableNumber: o.tableNumber,
    note: o.note,
    items: o.items,
    total: o.items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0),
  }));

  return NextResponse.json(ordersWithTotal);
}
