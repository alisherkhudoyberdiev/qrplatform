"use client";

// Public: cart + note; "Buyurtma berish" -> confirm page (V3 tasdiqlash)
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

type CartItem = { menuItemId: string; name: string; price: number; quantity: number };

export default function CartPage({
  params,
}: {
  params: Promise<{ locale: string; restaurantId: string }>;
}) {
  const [locale, setLocale] = useState<string>("uz");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuMap, setMenuMap] = useState<Record<string, { name: string; price: number }>>({});
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const addId = searchParams.get("add");
  const tableFromUrl = searchParams.get("table");

  useEffect(() => {
    params.then((p) => {
      setLocale((p as { locale?: string }).locale || "uz");
      setRestaurantId(p.restaurantId);
    });
  }, [params]);

  useEffect(() => {
    if (!restaurantId) return;
    fetch(`/api/restaurants/${restaurantId}/menu`)
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, { name: string; price: number }> = {};
        data.categories?.forEach((c: { menuItems: { id: string; name: string; price: number }[] }) => {
          c.menuItems?.forEach((m: { id: string; name: string; price: number }) => {
            map[m.id] = { name: m.name, price: m.price };
          });
        });
        setMenuMap(map);
      })
      .catch(() => {});
  }, [restaurantId]);

  const loadCart = useCallback(() => {
    if (!restaurantId) return;
    try {
      const raw = localStorage.getItem(`cart-${restaurantId}`);
      const items: CartItem[] = raw ? JSON.parse(raw) : [];
      setCart(items);
    } catch {
      setCart([]);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (!restaurantId || !addId || !menuMap[addId]) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === addId);
      const next = existing
        ? prev.map((i) =>
            i.menuItemId === addId ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [
            ...prev,
            {
              menuItemId: addId,
              name: menuMap[addId].name,
              price: menuMap[addId].price,
              quantity: 1,
            },
          ];
      localStorage.setItem(`cart-${restaurantId}`, JSON.stringify(next));
      return next;
    });
  }, [restaurantId, addId, menuMap]);

  const updateQty = (menuItemId: string, delta: number) => {
    if (!restaurantId) return;
    setCart((prev) => {
      const item = prev.find((i) => i.menuItemId === menuItemId);
      if (!item) return prev;
      const newQty = Math.max(0, item.quantity + delta);
      const next =
        newQty === 0
          ? prev.filter((i) => i.menuItemId !== menuItemId)
          : prev.map((i) =>
              i.menuItemId === menuItemId ? { ...i, quantity: newQty } : i
            );
      localStorage.setItem(`cart-${restaurantId}`, JSON.stringify(next));
      return next;
    });
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const goToConfirm = () => {
    if (!restaurantId) return;
    if (cart.length === 0) {
      setError("Savat bo‘sh. Avval menyudan mahsulot tanlang.");
      return;
    }
    setError(null);
    localStorage.setItem(`cart-note-${restaurantId}`, note.trim());
    const confirmUrl = tableFromUrl
      ? `/${locale}/menu/${restaurantId}/confirm?table=${tableFromUrl}`
      : `/${locale}/menu/${restaurantId}/confirm`;
    router.push(confirmUrl);
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("uz-UZ").format(n) + " so‘m";

  if (!restaurantId) return null;

  const prefix = `/${locale}/menu/${restaurantId}`;
  const cartLink = tableFromUrl ? `${prefix}/cart?table=${tableFromUrl}` : `${prefix}/cart`;
  const menuLink = tableFromUrl ? `${prefix}?table=${tableFromUrl}` : prefix;

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href={menuLink}
            className="text-emerald-600 font-medium"
          >
            ← Menyu
          </Link>
          <h1 className="text-xl font-semibold text-stone-800 mt-2">Savat</h1>
          {tableFromUrl && (
            <p className="text-sm text-stone-500 mt-0.5">Stol: {tableFromUrl}</p>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-stone-500 mb-2">Savat bo‘sh.</p>
            <p className="text-sm text-stone-400 mb-4">Menyudan mahsulot tanlang.</p>
            <Link
              href={menuLink}
              className="inline-block px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Menyuni ko‘rish
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {cart.map((i) => (
                <li
                  key={i.menuItemId}
                  className="bg-white rounded-lg border border-stone-200 p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-stone-800">{i.name}</p>
                    <p className="text-stone-600">
                      {formatPrice(i.price)} × {i.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQty(i.menuItemId, -1)}
                      className="w-8 h-8 rounded border border-stone-300 text-stone-600"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{i.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(i.menuItemId, 1)}
                      className="w-8 h-8 rounded border border-stone-300 text-stone-600"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <label htmlFor="note" className="block text-sm font-medium text-stone-700 mb-1">
                Izoh (ixtiyoriy)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Masalan: Achchiq bo‘lmasin, piyozsiz"
                rows={2}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg resize-none"
              />
            </div>
          </>
        )}
        {error && (
          <p className="mt-4 text-red-600 text-sm">{error}</p>
        )}
      </main>

      {cart.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 max-w-2xl mx-auto">
          <p className="text-stone-600 mb-2">
            Jami: <strong>{formatPrice(total)}</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              if (cart.length === 0) {
                setError("Savat bo‘sh. Avval menyudan mahsulot tanlang.");
                return;
              }
              setError(null);
              localStorage.setItem(`cart-note-${restaurantId}`, note.trim());
              router.push(tableFromUrl ? `/${locale}/menu/${restaurantId}/confirm?table=${tableFromUrl}` : `/${locale}/menu/${restaurantId}/confirm`);
            }}
            className="w-full py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600"
          >
            Buyurtma berish
          </button>
        </footer>
      )}
    </div>
  );
}
