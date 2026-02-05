// Public: get order status
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Buyurtma ID kerak" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { menuItem: true } },
      restaurant: { select: { name: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    restaurantName: order.restaurant.name,
    tableNumber: order.tableNumber,
    note: order.note,
    items: order.items,
  });
}
