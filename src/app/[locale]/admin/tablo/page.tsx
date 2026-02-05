// Tablo — buyurtmalar holatini ekranda ko'rsatish (katta matn, real vaqt)
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import TabloScreen from "./TabloScreen";

export default async function TabloPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireAdmin();
  if (!session) redirect(`/${locale}/admin/login`);
  if (session.isSuperAdmin && !session.restaurantId) redirect(`/${locale}/admin/superadmin`);
  return <TabloScreen />;
}
