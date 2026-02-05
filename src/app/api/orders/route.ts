// Public: create order (no payment in MVP)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type OrderItemInput = { menuItemId: string; quantity: number };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, items, tableNumber, note, paymentMethod } = body as {
      restaurantId: string;
      items: OrderItemInput[];
      tableNumber?: string | null;
      note?: string | null;
      paymentMethod?: string | null;
    };

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restoran ID kerak" },
        { status: 400 }
      );
    }
    if (!items?.length) {
      return NextResponse.json(
        { error: "Savat bo‘sh. Kamida bitta mahsulot tanlang." },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      return NextResponse.json({ error: "Restoran topilmadi" }, { status: 404 });
    }

    const order = await prisma.order.create({
      data: {
        restaurantId,
        status: "new",
        tableNumber: tableNumber?.trim() || null,
        note: note?.trim() || null,
        paymentMethod: ["naqd", "payme", "click"].includes(paymentMethod?.trim() || "")
          ? paymentMethod?.trim() || null
          : null,
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: Math.max(1, item.quantity),
          })),
        },
      },
      include: {
        items: { include: { menuItem: true } },
      },
    });

    return NextResponse.json({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items,
    });
  } catch (e) {
    console.error("Order create error:", e);
    return NextResponse.json(
      { error: "Buyurtma yaratishda xatolik" },
      { status: 500 }
    );
  }
}
