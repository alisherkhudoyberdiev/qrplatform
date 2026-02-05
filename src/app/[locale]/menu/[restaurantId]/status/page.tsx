"use client";

// Public: order status (mobile-first)
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type OrderItem = {
  menuItem: { name: string; price: number };
  quantity: number;
};

type OrderStatus = {
  id: string;
  status: string;
  createdAt: string;
  restaurantName: string;
  tableNumber?: string | null;
  note?: string | null;
  items: OrderItem[];
};

const statusLabels: Record<string, string> = {
  new: "Yangi",
  preparing: "Tayyorlanmoqda",
  ready: "Tayyor",
};

export default function StatusPage({
  params,
}: {
  params: Promise<{ locale: string; restaurantId: string }>;
}) {
  const [locale, setLocale] = useState<string>("uz");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    params.then((p) => {
      setLocale((p as { locale?: string }).locale || "uz");
      setRestaurantId(p.restaurantId);
    });
  }, [params]);
  useEffect(() => {
    setOrderId(searchParams.get("orderId"));
  }, [searchParams]);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    const fetchStatus = () => {
      fetch(`/api/orders/${orderId}/status`)
        .then((res) => {
          if (!res.ok) throw new Error("Buyurtma topilmadi");
          return res.json();
        })
        .then(setOrder)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("uz-UZ").format(n) + " so‘m";

  if (!restaurantId) return null;

  if (!orderId) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <p className="text-stone-500">Buyurtma ID kerak (URL da ?orderId=...)</p>
        <Link href={`/${locale}/menu/${restaurantId}`} className="mt-4 text-amber-600 font-medium">
          Menyuga qaytish
        </Link>
      </div>
    );
  }

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <p className="text-stone-500">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-600">{error || "Xatolik"}</p>
        <Link href={`/${locale}/menu/${restaurantId}`} className="mt-4 text-amber-600 font-medium">
          Menyuga qaytish
        </Link>
      </div>
    );
  }

  const steps = [
    { key: "new", label: "Qabul qilindi" },
    { key: "preparing", label: "Tayyorlanmoqda" },
    { key: "ready", label: "Tayyor" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === order.status);
  const orderShortId = order.id.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen bg-stone-50 pb-8">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href={`/${locale}/menu/${restaurantId}`}
            className="text-amber-600 font-medium hover:text-amber-700"
          >
            ← Menyu
          </Link>
          <h1 className="text-xl font-semibold text-stone-800 mt-2">
            Buyurtma holati
          </h1>
          <p className="text-sm font-medium text-stone-600 mt-1">
            Buyurtma #{orderShortId}
          </p>
          <p className="text-sm text-stone-500">{order.restaurantName}</p>
          {order.tableNumber && (
            <p className="text-sm text-stone-600 mt-0.5">Stol: {order.tableNumber}</p>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-4">
            Holat
          </p>
          <div className="flex items-start justify-between gap-1">
            {steps.map((step, idx) => (
              <div key={step.key} className="flex-1 flex flex-col items-center min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                    idx < currentIndex
                      ? "bg-amber-500 text-white"
                      : idx === currentIndex
                        ? "bg-amber-500 text-white ring-4 ring-amber-100"
                        : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {idx < currentIndex ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-2 text-center leading-tight ${
                    idx <= currentIndex ? "text-stone-700 font-medium" : "text-stone-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex mt-2 mb-1 px-2">
            <div className={`h-1 flex-1 rounded-full ${currentIndex >= 1 ? "bg-amber-500" : "bg-stone-200"}`} />
            <div className={`h-1 flex-1 rounded-full mx-0.5 ${currentIndex >= 2 ? "bg-amber-500" : "bg-stone-200"}`} />
          </div>
          <p className="text-center text-lg font-medium text-stone-800 mt-2">
            {statusLabels[order.status] ?? order.status}
          </p>
        </div>

        <a
          href="#"
          className="flex items-center justify-center gap-2 w-full py-3 border border-stone-300 rounded-xl text-stone-700 font-medium hover:bg-stone-50 mb-6"
          onClick={(e) => e.preventDefault()}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Ofitsiant chaqirish
        </a>

        {order.note && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800">Izoh: {order.note}</p>
          </div>
        )}

        <ul className="space-y-2">
          {order.items.map((item, idx) => (
            <li
              key={idx}
              className="flex justify-between text-stone-700"
            >
              <span>
                {item.menuItem.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.menuItem.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-stone-400 mt-4">
          Yangilanishi: har 5 soniyada
        </p>
      </main>
    </div>
  );
}
