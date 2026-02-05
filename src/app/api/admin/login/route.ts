// Admin: login (email + password, session-based). SuperAdmin checked first.
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email va parol kiriting" },
        { status: 400 }
      );
    }

    const emailNorm = email.trim().toLowerCase();

    // 1) SuperAdmin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email: emailNorm },
    });
    if (superAdmin && (await bcrypt.compare(password, superAdmin.passwordHash))) {
      const session = await getSession();
      session.adminId = superAdmin.id;
      session.restaurantId = "";
      session.email = superAdmin.email;
      session.isLoggedIn = true;
      session.isSuperAdmin = true;
      await session.save();
      return NextResponse.json({
        ok: true,
        isSuperAdmin: true,
        restaurantId: null,
        restaurantName: null,
      });
    }

    // 2) Restaurant admin
    const admin = await prisma.adminUser.findUnique({
      where: { email: emailNorm },
      include: { restaurant: true },
    });

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return NextResponse.json(
        { error: "Email yoki parol noto'g'ri" },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.adminId = admin.id;
    session.restaurantId = admin.restaurantId;
    session.email = admin.email;
    session.isLoggedIn = true;
    session.isSuperAdmin = false;
    await session.save();

    return NextResponse.json({
      ok: true,
      isSuperAdmin: false,
      restaurantId: admin.restaurantId,
      restaurantName: admin.restaurant.name,
    });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { error: "Kirishda xatolik" },
      { status: 500 }
    );
  }
}
