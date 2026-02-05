"use client";

// Public: menu view — sticky cart, category nav, skeletons, table in URL
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl?: string | null;
  ingredients?: string | null;
  isAvailable: boolean;
};

type Category = {
  id: string;
  name: string;
  menuItems: MenuItem[];
};

type MenuData = {
  id: string;
  name: string;
  categories: Category[];
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(n) + " so‘m";
}

// Skeleton for menu loading
function MenuSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-pulse space-y-6">
      <div className="h-6 bg-stone-200 rounded w-1/3" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-lg" />
        ))}
      </div>
      <div className="h-6 bg-stone-200 rounded w-1/4 mt-8" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function MenuPage({
  params,
}: {
  params: Promise<{ locale: string; restaurantId: string }>;
}) {
  const [locale, setLocale] = useState<string>("uz");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [data, setData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const tableFromUrl = searchParams.get("table");

  useEffect(() => {
    params.then((p) => {
      setLocale((p as { locale?: string }).locale || "uz");
      setRestaurantId(p.restaurantId);
    });
  }, [params]);

  const refreshCartSummary = useCallback(() => {
    if (!restaurantId) return;
    try {
      const raw = localStorage.getItem(`cart-${restaurantId}`);
      const items: { menuItemId: string; price: number; quantity: number }[] = raw ? JSON.parse(raw) : [];
      setCartCount(items.reduce((s, i) => s + i.quantity, 0));
      setCartTotal(items.reduce((s, i) => s + i.price * i.quantity, 0));
    } catch {
      setCartCount(0);
      setCartTotal(0);
    }
  }, [restaurantId]);

  useEffect(() => {
    refreshCartSummary();
    const onVisibility = () => refreshCartSummary();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [refreshCartSummary]);

  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/restaurants/${restaurantId}/menu`)
      .then((res) => {
        if (!res.ok) throw new Error("Menyu yuklanmadi");
        return res.json();
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  if (!restaurantId) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 pb-24">
        <header className="bg-white border-b border-stone-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="h-6 bg-stone-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-stone-100 rounded w-16 mt-2 animate-pulse" />
          </div>
        </header>
        <MenuSkeleton />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-600 text-center">{error || "Xatolik"}</p>
        <p className="text-sm text-stone-500 mt-2">Restoran topilmadi yoki menyu mavjud emas.</p>
        <Link href={`/${locale}`} className="mt-4 text-amber-600 underline">
          Bosh sahifaga
        </Link>
      </div>
    );
  }

  const prefix = `/${locale}/menu/${restaurantId}`;
  const cartHref = tableFromUrl ? `${prefix}/cart?table=${tableFromUrl}` : `${prefix}/cart`;
  const addToCartHref = (itemId: string) =>
    tableFromUrl ? `${prefix}/cart?table=${tableFromUrl}&add=${itemId}` : `${prefix}/cart?add=${itemId}`;
  const itemDetailHref = (itemId: string) =>
    tableFromUrl ? `${prefix}/item/${itemId}?table=${tableFromUrl}` : `${prefix}/item/${itemId}`;

  const hasCategories = data.categories.length > 0;
  const hasItems = data.categories.some((c) => c.menuItems.length > 0);

  const q = searchQuery.trim().toLowerCase();
  const filteredCategories = !q
    ? data.categories
    : data.categories
        .map((cat) => ({
          ...cat,
          menuItems: cat.menuItems.filter(
            (item) =>
              cat.name.toLowerCase().includes(q) ||
              item.name.toLowerCase().includes(q) ||
              (item.description && item.description.toLowerCase().includes(q)) ||
              (item.ingredients && item.ingredients.toLowerCase().includes(q))
          ),
        }))
        .filter((cat) => cat.menuItems.length > 0 || cat.name.toLowerCase().includes(q));

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-stone-800">{data.name}</h1>
          <p className="text-sm text-stone-500 mt-0.5">Menyu</p>
          {tableFromUrl && (
            <p className="text-sm text-stone-600 mt-0.5">Stol: {tableFromUrl}</p>
          )}
        </div>
        <div className="px-4 pb-3">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ovqat qidirish…"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            aria-label="Ovqat qidirish"
          />
        </div>
        {hasCategories && (
          <nav className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide border-t border-stone-100">
            {filteredCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className="shrink-0 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm hover:bg-stone-200"
              >
                {cat.name}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {hasCategories && filteredCategories.length > 0 && (
          <section className="mb-8">
            <h2 className="sr-only">Kategoriyalar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredCategories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.id}`}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-xl border border-stone-200 shadow-sm hover:border-amber-300 hover:bg-amber-50/50 transition min-h-[100px]"
                >
                  <span className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </span>
                  <span className="font-medium text-stone-800 text-center text-sm leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-xs text-stone-500">
                    {cat.menuItems.length} ta
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
        {!hasCategories || !hasItems ? (
          <div className="text-center py-12">
            <p className="text-stone-500">Hozircha menyuda mahsulot yo‘q.</p>
            <p className="text-sm text-stone-400 mt-1">Keyinroq qaytib kiring.</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500">Qidiruv bo‘yicha natija topilmadi.</p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <section
              key={cat.id}
              id={`cat-${cat.id}`}
              className="mb-8 scroll-mt-24"
            >
              <h2 className="text-lg font-medium text-stone-700 mb-3">
                {cat.name}
              </h2>
              <ul className="space-y-3">
                {cat.menuItems.map((item) => (
                  <li
                    key={item.id}
                    className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="w-20 h-20 rounded-lg bg-stone-100 shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={itemDetailHref(item.id)}
                          className="font-medium text-stone-800 hover:text-amber-600 block"
                        >
                          {item.name}
                        </Link>
                        {item.description && (
                          <p className="text-sm text-stone-500 mt-0.5">{item.description}</p>
                        )}
                        {item.ingredients && (
                          <p className="text-xs text-stone-400 mt-1">{item.ingredients}</p>
                        )}
                        <p className="text-stone-700 font-semibold mt-1">{formatPrice(item.price)}</p>
                      </div>
                      <Link
                        href={addToCartHref(item.id)}
                        className="shrink-0 self-center px-3 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600"
                      >
                        + Qo‘shish
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </main>

      {/* Sticky cart button: count + total */}
      <Link
        href={cartHref}
        className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto flex items-center justify-between gap-4 bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-amber-600 z-20"
      >
        <span className="font-medium">
          Savat {cartCount > 0 ? `(${cartCount})` : ""}
        </span>
        <span className="font-semibold">
          {cartTotal > 0 ? formatPrice(cartTotal) : "Bo‘sh"}
        </span>
      </Link>
    </div>
  );
}
