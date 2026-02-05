// Demo: menyu / admin / QR havolalari (oldingi bosh sahifa)
import Link from "next/link";

const DEMO_RESTAURANT_ID = "seed-restaurant-1";

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <Link href={base} className="absolute top-4 left-4 text-stone-500 hover:text-stone-700 text-sm">
        ← Landing
      </Link>
      <h1 className="text-2xl font-semibold text-stone-800 mb-2">Demo</h1>
      <p className="text-stone-500 mb-8 text-center">
        Restoran menyusi va buyurtma tizimi (namuna)
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`${base}/menu/${DEMO_RESTAURANT_ID}/welcome`}
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 text-center"
        >
          Welcome (QR ekrani)
        </Link>
        <Link
          href={`${base}/menu/${DEMO_RESTAURANT_ID}`}
          className="px-6 py-3 bg-stone-200 text-stone-800 font-medium rounded-lg hover:bg-stone-300 text-center"
        >
          Menyu (mijoz)
        </Link>
        <Link
          href={`${base}/admin/login`}
          className="px-6 py-3 bg-stone-200 text-stone-800 font-medium rounded-lg hover:bg-stone-300 text-center"
        >
          Admin panel
        </Link>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 text-sm">
        <Link href={`${base}/menu/${DEMO_RESTAURANT_ID}/welcome?table=5`} className="text-emerald-600 hover:underline">
          Welcome + Stol 5
        </Link>
        <Link href={`${base}/menu/${DEMO_RESTAURANT_ID}/qr`} className="text-emerald-600 hover:underline">
          QR kod sahifa
        </Link>
      </div>
      <p className="text-sm text-stone-400 mt-8">
        Admin: admin@oshxona.uz / admin123
      </p>
    </div>
  );
}
