// SuperAdmin: list all restaurants (GET) or create restaurant (POST)
import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { adminUsers: true, orders: true } },
    },
  });
  return NextResponse.json(restaurants);
}

export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { name } = body as { name?: string };
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Restoran nomi kerak" },
        { status: 400 }
      );
    }
    const restaurant = await prisma.restaurant.create({
      data: { name: name.trim() },
    });
    return NextResponse.json(restaurant);
  } catch (e) {
    console.error("SuperAdmin create restaurant:", e);
    return NextResponse.json(
      { error: "Restoran yaratishda xatolik" },
      { status: 500 }
    );
  }
}
