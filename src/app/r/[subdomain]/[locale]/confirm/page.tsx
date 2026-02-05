"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { useLocale } from "@/i18n/locale-context";

type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(n) + " so'm";
}

const ESTIMATED_MIN = 15;

type PaymentMethod = "naqd" | "payme" | "click";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; sub: string; icon: "cash" | "card" | "hand" }[] = [
  { id: "naqd", label: "Naqd pul", sub: "Joyida to'lov", icon: "cash" },
  { id: "payme", label: "Payme", sub: "Online karta orqali", icon: "card" },
  { id: "click", label: "Click", sub: "Online hamyon", icon: "hand" },
];

export default function SubdomainConfirmPage() {
  const { restaurantId } = useRestaurant();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableFromUrl = searchParams.get("table");

  const prefix = `/${locale}`;
  const menuPrefix = `${prefix}/menu`;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("naqd");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`cart-${restaurantId}`);
      const items: CartItem[] = raw ? JSON.parse(raw) : [];
      setCart(items);
      const noteRaw = localStorage.getItem(`cart-note-${restaurantId}`);
      setNote(noteRaw || "");
    } catch {
      setCart([]);
    }
    fetch(`/api/restaurants/${restaurantId}/menu`)
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, { imageUrl?: string | null }> = {};
        data.categories?.forEach((c: { menuItems: { id: string; imageUrl?: string | null }[] }) => {
          c.menuItems?.forEach((m: { id: string; imageUrl?: string | null }) => {
            map[m.id] = { imageUrl: m.imageUrl ?? null };
          });
        });
        setCart((prev) =>
          prev.map((i) => ({ ...i, imageUrl: map[i.menuItemId]?.imageUrl ?? null }))
        );
      })
      .catch(() => {});
  }, [restaurantId]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal;

  const handleTasdiqlash = () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError(null);
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        items: cart.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        tableNumber: tableFromUrl?.trim() || null,
        note: note.trim() || null,
        paymentMethod,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error((data as { error?: string }).error || "Xatolik");
        return data as { id: string };
      })
      .then((d) => {
        setOrderId(d.id);
        localStorage.removeItem(`cart-${restaurantId}`);
        localStorage.removeItem(`cart-note-${restaurantId}`);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  if (orderId) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-stone-800">Buyurtma qabul qilindi!</p>
        <p className="text-sm text-stone-500 mt-1">ID: {orderId}</p>
        <Link
          href={`${prefix}/status?orderId=${orderId}`}
          className="mt-6 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600"
        >
          Buyurtma holatini ko'rish
        </Link>
        <Link
          href={tableFromUrl ? `${menuPrefix}?table=${tableFromUrl}` : menuPrefix}
          className="mt-3 text-stone-500 underline text-sm"
        >
          Menyuga qaytish
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <p className="text-stone-600">Savat bo'sh.</p>
        <Link
          href={tableFromUrl ? `${menuPrefix}?table=${tableFromUrl}` : menuPrefix}
          className="mt-4 text-amber-600 font-medium"
        >
          Menyuga o'tish
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href={tableFromUrl ? `${prefix}/cart?table=${tableFromUrl}` : `${prefix}/cart`}
            className="text-emerald-600 font-medium inline-flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Savat
          </Link>
          <h1 className="text-xl font-semibold text-stone-800 mt-2">Buyurtmani tasdiqlash</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="text-xs text-stone-500">Stol raqami</p>
            <p className="text-lg font-bold text-stone-800">{tableFromUrl || "—"}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-xs text-stone-500">Tahminiy vaqt</p>
            <p className="text-lg font-bold text-stone-800">~{ESTIMATED_MIN} daq</p>
          </div>
        </div>

        <section className="mb-6">
          <h2 className="text-stone-800 font-semibold mb-3">Buyurtmangiz</h2>
          <ul className="space-y-3">
            {cart.map((i) => (
              <li key={i.menuItemId} className="flex gap-3 bg-white rounded-xl border border-stone-200 p-3">
                <div className="w-14 h-14 rounded-lg bg-stone-100 shrink-0 overflow-hidden">
                  {i.imageUrl ? (
                    <img src={i.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 truncate">{i.name}</p>
                  <p className="text-sm text-stone-500">
                    {i.quantity} × {formatPrice(i.price)}
                  </p>
                </div>
                <p className="font-semibold text-stone-800 shrink-0">
                  {formatPrice(i.price * i.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
          <div className="flex justify-between font-bold text-stone-800 pt-2 border-t border-stone-200">
            <span>Jami</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <section className="mb-6">
          <h2 className="text-stone-800 font-semibold mb-3">To'lov turi</h2>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPaymentMethod(opt.id)}
                className={`w-full rounded-xl border-2 p-4 flex items-center justify-between text-left transition ${
                  paymentMethod === opt.id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <p className="font-medium text-stone-800">{opt.label}</p>
                  {opt.id !== "naqd" && (
                    <p className="text-xs text-amber-600">Demo — to'lov o'tkazilmaydi</p>
                  )}
                </div>
                {paymentMethod === opt.id && (
                  <span className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {note && (
          <p className="text-sm text-amber-800 bg-amber-50 rounded-lg p-3 mb-4">Izoh: {note}</p>
        )}
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={handleTasdiqlash}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? "Yuborilmoqda..." : "Tasdiqlash"}
        </button>
      </footer>
    </div>
  );
}
