// Admin: redirect to restaurant QR page
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export default async function AdminQRPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireAdmin();
  if (!session) redirect(`/${locale}/admin/login`);
  if (session.isSuperAdmin && !session.restaurantId)
    redirect(`/${locale}/admin/superadmin`);
  redirect(`/${locale}/menu/${session.restaurantId}/qr`);
}
