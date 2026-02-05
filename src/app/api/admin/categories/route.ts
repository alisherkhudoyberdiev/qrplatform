// Admin: list & create categories
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { restaurantId: session.restaurantId },
    include: { menuItems: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  }

  const body = await req.json();
  const { name } = body as { name?: string };
  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Kategoriya nomi kerak" },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      restaurantId: session.restaurantId,
    },
  });
  return NextResponse.json(category);
}
