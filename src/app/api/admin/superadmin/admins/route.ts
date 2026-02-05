// SuperAdmin: create admin user for a restaurant
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { restaurantId, email, password } = body as {
      restaurantId?: string;
      email?: string;
      password?: string;
    };
    if (!restaurantId?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Restoran, email va parol kerak" },
        { status: 400 }
      );
    }
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId.trim() },
    });
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restoran topilmadi" },
        { status: 404 }
      );
    }
    const emailNorm = email.trim().toLowerCase();
    const existing = await prisma.adminUser.findUnique({
      where: { email: emailNorm },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Bu email allaqachon ro'yxatdan o'tgan" },
        { status: 400 }
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.adminUser.create({
      data: {
        email: emailNorm,
        passwordHash,
        restaurantId: restaurant.id,
      },
      include: { restaurant: true },
    });
    return NextResponse.json(admin);
  } catch (e) {
    console.error("SuperAdmin create admin:", e);
    return NextResponse.json(
      { error: "Admin yaratishda xatolik" },
      { status: 500 }
    );
  }
}
