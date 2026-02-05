// Public: fetch menu (categories + items) for a restaurant
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: restaurantId } = await params;
  if (!restaurantId) {
    return NextResponse.json({ error: "Restaurant ID kerak" }, { status: 400 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      categories: {
        include: {
          menuItems: {
            where: { isAvailable: true },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Restoran topilmadi" }, { status: 404 });
  }

  return NextResponse.json({
    id: restaurant.id,
    name: restaurant.name,
    logoUrl: restaurant.logoUrl ?? null,
    coverImageUrl: restaurant.coverImageUrl ?? null,
    promoText: restaurant.promoText ?? null,
    categories: restaurant.categories,
  });
}
