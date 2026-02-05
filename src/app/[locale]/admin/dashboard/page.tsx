// Admin: dashboard (today orders, revenue, latest orders)
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { getDashboardData } from "@/lib/admin-data";

function formatPrice(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(n) + " so‘m";
}

const statusLabels: Record<string, string> = {
  new: "Yangi",
  preparing: "Tayyorlanmoqda",
  ready: "Tayyor",
};

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireAdmin();
  if (!session) redirect(`/${locale}/admin/login`);
  if (session.isSuperAdmin && !session.restaurantId)
    redirect(`/${locale}/admin/superadmin`);
  const data = await getDashboardData();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-stone-800 mb-2">Boshqaruv paneli</h1>
      <p className="text-stone-500 text-sm mb-6">Bugungi ko‘rsatkichlar va tezkor harakatlar</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
          <p className="text-sm text-stone-500">Bugungi buyurtmalar</p>
          <p className="text-2xl font-semibold text-stone-800">{data.todayOrderCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
          <p className="text-sm text-stone-500">Umumiy daromad</p>
          <p className="text-2xl font-semibold text-stone-800">
            {formatPrice(data.totalRevenue)}
          </p>
        </div>
      </div>

      {/* Tezkor harakatlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link
          href={`/${locale}/admin/menu`}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition"
        >
          <span className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </span>
          <div>
            <p className="font-medium text-stone-800">Menyuni tahrirlash</p>
            <p className="text-xs text-stone-500">Yangi taom qo‘shish</p>
          </div>
        </Link>
        <Link
          href={`/${locale}/admin/qr`}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition"
        >
          <span className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </span>
          <div>
            <p className="font-medium text-stone-800">QR kod yuklash</p>
            <p className="text-xs text-stone-500">Stol uchun stikerlar</p>
          </div>
        </Link>
        <Link
          href={`/${locale}/admin/orders`}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition"
        >
          <span className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </span>
          <div>
            <p className="font-medium text-stone-800">Buyurtmalar</p>
            <p className="text-xs text-stone-500">Barchasini ko‘rish</p>
          </div>
        </Link>
      </div>

      {data.topSelling && data.topSelling.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-medium text-stone-700 mb-3">Top taomlar</h2>
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <ul className="divide-y divide-stone-200">
              {data.topSelling.map((item, idx) => (
                <li key={item.id} className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-stone-100 shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-lg font-bold">
                        #{idx + 1}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-stone-800 flex-1">{item.name}</span>
                  <span className="text-stone-600">{item.quantity} ta buyurtma</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-medium text-stone-700 mb-3">So‘nggi buyurtmalar</h2>
        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          {data.latestOrders.length === 0 ? (
            <p className="p-4 text-stone-500">Buyurtmalar yo‘q</p>
          ) : (
            <ul className="divide-y divide-stone-200">
              {data.latestOrders.map((o) => (
                <li key={o.id} className="p-4 flex justify-between items-center">
                  <div>
                    <Link href={`/${locale}/admin/orders?highlight=${o.id}`} className="font-medium text-emerald-600 hover:underline">
                      #{o.id.slice(-6)}
                    </Link>
                    <span className="ml-2 text-sm text-stone-500">
                      {statusLabels[o.status] ?? o.status}
                    </span>
                  </div>
                  <span className="font-medium text-stone-700">{formatPrice(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link
          href={`/${locale}/admin/orders`}
          className="inline-block mt-3 text-emerald-600 font-medium hover:underline"
        >
          Barcha buyurtmalar →
        </Link>
      </section>
    </div>
  );
}
