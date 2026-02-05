// Admin: update & delete category
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
  const { name } = body as { name?: string };
  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Kategoriya nomi kerak" },
      { status: 400 }
    );
  }

  const category = await prisma.category.findFirst({
    where: { id, restaurantId: session.restaurantId },
  });
  if (!category) {
    return NextResponse.json({ error: "Kategoriya topilmadi" }, { status: 404 });
  }

  const updated = await prisma.category.update({
    where: { id },
    data: { name: name.trim() },
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
  const category = await prisma.category.findFirst({
    where: { id, restaurantId: session.restaurantId },
  });
  if (!category) {
    return NextResponse.json({ error: "Kategoriya topilmadi" }, { status: 404 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
