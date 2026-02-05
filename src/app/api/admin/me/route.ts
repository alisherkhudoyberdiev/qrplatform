// Admin: current session (for protected routes)
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  }

  if (session.isSuperAdmin) {
    return NextResponse.json({
      email: session.email,
      isSuperAdmin: true,
      restaurantId: session.restaurantId || null,
      restaurantName: session.restaurantId
        ? (await prisma.restaurant.findUnique({ where: { id: session.restaurantId } }))?.name ?? null
        : null,
    });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.restaurantId },
  });
  if (!restaurant) {
    return NextResponse.json({ error: "Restoran topilmadi" }, { status: 404 });
  }

  return NextResponse.json({
    email: session.email,
    isSuperAdmin: false,
    restaurantId: session.restaurantId,
    restaurantName: restaurant.name,
  });
}
