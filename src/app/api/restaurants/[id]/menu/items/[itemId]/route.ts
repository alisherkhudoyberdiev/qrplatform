// Public: fetch single menu item for detail page (belongs to restaurant)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: restaurantId, itemId } = await params;
  if (!restaurantId || !itemId) {
    return NextResponse.json({ error: "ID kerak" }, { status: 400 });
  }

  const item = await prisma.menuItem.findFirst({
    where: {
      id: itemId,
      category: { restaurantId },
    },
    include: { category: true },
  });

  if (!item) {
    return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
  }

  return NextResponse.json(item);
}
