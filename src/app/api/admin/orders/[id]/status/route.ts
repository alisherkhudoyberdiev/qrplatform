// Admin: update order status
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = ["new", "preparing", "ready"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body as { status?: string };
  if (!status || !ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
    return NextResponse.json(
      { error: "Status: new, preparing yoki ready bo'lishi kerak" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findFirst({
    where: { id, restaurantId: session.restaurantId },
  });
  if (!order) {
    return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(updated);
}
