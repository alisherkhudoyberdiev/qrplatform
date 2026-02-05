"use client";

// Screen 4: Food detail — large image, ingredients, allergens, portion, price, quantity, sticky CTA
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";

type Item = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  ingredients: string | null;
  allergens: string | null;
  portionSize: string | null;
  isAvailable: boolean;
  category: { name: string };
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(n) + " so'm";
}

export default function ItemDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "uz";
  const restaurantId = params.restaurantId as string;
  const itemId = params.itemId as string;
  const tableFromUrl = searchParams.get("table");
  const prefix = `/${locale}/menu/${restaurantId}`;
  const menuHref = tableFromUrl ? `${prefix}?table=${tableFromUrl}` : prefix;
  const cartHref = tableFromUrl ? `${prefix}/cart?table=${tableFromUrl}` : `${prefix}/cart`;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!restaurantId || !itemId) return;
    fetch(`/api/restaurants/${restaurantId}/menu/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Topilmadi");
        return res.json();
      })
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [restaurantId, itemId]);

  const addToCart = () => {
    if (!item || !restaurantId) return;
    try {
      const raw = localStorage.getItem(`cart-${restaurantId}`);
      const items: { menuItemId: string; name: string; price: number; quantity: number }[] = raw
        ? JSON.parse(raw)
        : [];
      const existing = items.find((i) => i.menuItemId === item.id);
      const next = existing
        ? items.map((i) =>
            i.menuItemId === item.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [
            ...items,
            {
              menuItemId: item.id,
              name: item.name,
              price: item.price,
              quantity,
            },
          ];
      localStorage.setItem(`cart-${restaurantId}`, JSON.stringify(next));
      router.push(cartHref);
    } catch {
      router.push(cartHref);
    }
  };

  if (!restaurantId || !itemId) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-stone-300" />
      </div>
    );
  }
  if (!item) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <p className="text-stone-600">Mahsulot topilmadi.</p>
        <Link href={menuHref} className="mt-4 text-amber-600 font-medium">
          Menyuga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link
            href={menuHref}
            className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-800 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Menyu
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        <div className="aspect-[4/3] bg-stone-200 overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
              </svg>
            </div>
          )}
        </div>

        <div className="px-4 py-6 bg-white border-b border-stone-200">
          {!item.isAvailable && (
            <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-sm font-medium mb-2">
              Mavjud emas
            </span>
          )}
          <h1 className="text-xl font-semibold text-stone-800">{item.name}</h1>
          {item.description && (
            <p className="text-stone-600 mt-1">{item.description}</p>
          )}
          {item.ingredients && (
            <div className="mt-3">
              <h2 className="text-sm font-medium text-stone-500">Ingredientlar</h2>
              <p className="text-stone-700 text-sm mt-0.5">{item.ingredients}</p>
            </div>
          )}
          {item.allergens && (
            <div className="mt-3">
              <h2 className="text-sm font-medium text-stone-500">Allergenlar</h2>
              <p className="text-stone-700 text-sm mt-0.5">{item.allergens}</p>
            </div>
          )}
          {item.portionSize && (
            <div className="mt-3">
              <h2 className="text-sm font-medium text-stone-500">Poriya</h2>
              <p className="text-stone-700 text-sm mt-0.5">{item.portionSize}</p>
            </div>
          )}
          <p className="text-lg font-bold text-stone-800 mt-4">{formatPrice(item.price)}</p>
        </div>

        <div className="px-4 py-4 bg-white flex items-center justify-between">
          <span className="text-sm font-medium text-stone-600">Miqdor</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-full border border-stone-300 text-stone-600 font-medium hover:bg-stone-100"
              aria-label="Kamaytirish"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold text-stone-800">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 rounded-full border border-stone-300 text-stone-600 font-medium hover:bg-stone-100"
              aria-label="Oshirish"
            >
              +
            </button>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={addToCart}
          disabled={!item.isAvailable}
          className="w-full py-3.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Savatga qo&apos;shish {quantity > 1 ? `(${quantity} ta)` : ""}
        </button>
      </footer>
    </div>
  );
}
