// SuperAdmin: switch context to a restaurant (or exit to superadmin)
import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const restaurantId = (body.restaurantId as string)?.trim() || null;
    if (restaurantId) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return NextResponse.json(
          { error: "Restoran topilmadi" },
          { status: 404 }
        );
      }
    }
    const s = await getSession();
    s.restaurantId = restaurantId || "";
    await s.save();
    return NextResponse.json({
      ok: true,
      restaurantId: restaurantId || null,
    });
  } catch (e) {
    console.error("SuperAdmin switch:", e);
    return NextResponse.json(
      { error: "Kontekstni o'zgartirishda xatolik" },
      { status: 500 }
    );
  }
}
