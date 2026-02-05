// Admin: list & create menu items
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  }

  const items = await prisma.menuItem.findMany({
    where: {
      category: { restaurantId: session.restaurantId },
    },
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  }

  const body = await req.json();
  const { name, price, description, imageUrl, ingredients, allergens, portionSize, categoryId, isAvailable } = body as {
    name?: string;
    price?: number;
    description?: string;
    imageUrl?: string | null;
    ingredients?: string | null;
    allergens?: string | null;
    portionSize?: string | null;
    categoryId?: string;
    isAvailable?: boolean;
  };

  if (!name?.trim() || price == null || price < 0 || !categoryId) {
    return NextResponse.json(
      { error: "Nomi, narx va kategoriya kerak" },
      { status: 400 }
    );
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, restaurantId: session.restaurantId },
  });
  if (!category) {
    return NextResponse.json({ error: "Kategoriya topilmadi" }, { status: 404 });
  }

  const item = await prisma.menuItem.create({
    data: {
      name: name.trim(),
      price: Math.round(price),
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      ingredients: ingredients?.trim() || null,
      allergens: allergens?.trim() || null,
      portionSize: portionSize?.trim() || null,
      categoryId,
      isAvailable: isAvailable ?? true,
    },
    include: { category: true },
  });
  return NextResponse.json(item);
}
