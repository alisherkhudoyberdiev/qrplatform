// Admin layout: redirect to login if not authenticated
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { ExitSuperAdminButton } from "./ExitSuperAdminButton";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await requireAdmin();
  const { locale } = await params;
  const base = `/${locale}`;
  return (
    <div className="min-h-screen bg-stone-100">
      {session ? (
        <>
          <nav className="bg-white border-b border-stone-200 px-4 py-3 flex gap-4 items-center flex-wrap">
            {session.isSuperAdmin && (
              <Link
                href={`${base}/admin/superadmin`}
                className="text-amber-600 font-medium hover:text-amber-700"
              >
                Superadmin
              </Link>
            )}
            <Link href={`${base}/admin/dashboard`} className="text-emerald-600 font-medium">
              Boshqaruv
            </Link>
            <Link href={`${base}/admin/menu`} className="text-stone-600 hover:text-stone-800">
              Menyu
            </Link>
            <Link href={`${base}/admin/orders`} className="text-stone-600 hover:text-stone-800">
              Buyurtmalar
            </Link>
            <Link href={`${base}/admin/tablo`} className="text-stone-600 hover:text-stone-800">
              Tablo
            </Link>
            {session.isSuperAdmin && session.restaurantId ? (
              <ExitSuperAdminButton />
            ) : null}
            <LogoutButton />
          </nav>
          {children}
        </>
      ) : (
        <>{children}</>
      )}
    </div>
  );
}
