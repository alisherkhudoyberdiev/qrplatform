// Admin: orders list + update status (auto-refresh 5s)
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import OrdersManager from "./OrdersManager";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireAdmin();
  if (!session) redirect(`/${locale}/admin/login`);
  if (session.isSuperAdmin && !session.restaurantId)
    redirect(`/${locale}/admin/superadmin`);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Buyurtmalar</h1>
      <OrdersManager />
    </div>
  );
}
