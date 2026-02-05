// Admin: menu management (CRUD categories + items, inline price, availability)
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MenuManager from "./MenuManager";

export default async function AdminMenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireAdmin();
  if (!session) redirect(`/${locale}/admin/login`);
  if (session.isSuperAdmin && !session.restaurantId)
    redirect(`/${locale}/admin/superadmin`);

  const [categories, menuItems] = await Promise.all([
    prisma.category.findMany({
      where: { restaurantId: session.restaurantId },
      include: { menuItems: true },
      orderBy: { name: "asc" },
    }),
    prisma.menuItem.findMany({
      where: { category: { restaurantId: session.restaurantId } },
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Menyu boshqaruvi</h1>
      <MenuManager
        initialCategories={categories}
        initialMenuItems={menuItems}
      />
    </div>
  );
}
