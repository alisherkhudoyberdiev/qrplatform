// SuperAdmin: only superadmin can access; redirect others
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { SuperAdminPanel } from "./SuperAdminPanel";

export default async function SuperAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireSuperAdmin();
  if (!session) redirect(`/${locale}/admin/login`);
  return <SuperAdminPanel />;
}
