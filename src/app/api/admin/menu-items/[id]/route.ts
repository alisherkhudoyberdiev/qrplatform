// Admin: update & delete menu item (inline price, availability)
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const existing = await prisma.menuItem.findFirst({
    where: {
      id,
      category: { restaurantId: session.restaurantId },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
  }

  const data: {
    name?: string;
    price?: number;
    description?: string | null;
    imageUrl?: string | null;
    ingredients?: string | null;
    allergens?: string | null;
    portionSize?: string | null;
    categoryId?: string;
    isAvailable?: boolean;
  } = {};
  if (name !== undefined) data.name = name.trim();
  if (price !== undefined) data.price = Math.round(price);
  if (description !== undefined) data.description = description?.trim() || null;
  if (imageUrl !== undefined) data.imageUrl = imageUrl?.trim() || null;
  if (ingredients !== undefined) data.ingredients = ingredients?.trim() || null;
  if (allergens !== undefined) data.allergens = allergens?.trim() || null;
  if (portionSize !== undefined) data.portionSize = portionSize?.trim() || null;
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (isAvailable !== undefined) data.isAvailable = isAvailable;

  const updated = await prisma.menuItem.update({
    where: { id },
    data,
    include: { category: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.menuItem.findFirst({
    where: {
      id,
      category: { restaurantId: session.restaurantId },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
  }

  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
