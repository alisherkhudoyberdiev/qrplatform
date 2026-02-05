"use client";

// V3: Welcome screen — STOL badge, Xush kelibsiz, Menuni ko'rish, aksiya (referens dizayn)
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

type RestaurantInfo = {
  id: string;
  name: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  promoText?: string | null;
};

export default function WelcomePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "uz";
  const restaurantId = params.restaurantId as string;
  const tableFromUrl = searchParams.get("table");
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    fetch(`/api/restaurants/${restaurantId}/menu`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data && setRestaurant({
        id: data.id,
        name: data.name,
        logoUrl: data.logoUrl ?? null,
        coverImageUrl: data.coverImageUrl ?? null,
        promoText: data.promoText ?? null,
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const menuHref = tableFromUrl
    ? `/${locale}/menu/${restaurantId}?table=${tableFromUrl}`
    : `/${locale}/menu/${restaurantId}`;

  if (!restaurantId) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-stone-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Cover / header */}
      <div className="relative h-40 bg-gradient-to-br from-emerald-700 to-emerald-900 overflow-hidden">
        {restaurant?.coverImageUrl ? (
          <img
            src={restaurant.coverImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/20" />
        <Link
          href={menuHref}
          className="absolute top-4 left-4 text-white/90 hover:text-white"
          aria-label="Orqaga"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>

      <div className="flex-1 -mt-10 px-4 pb-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
          {/* Logo */}
          <div className="flex justify-center pt-6">
            <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center overflow-hidden border-2 border-stone-200">
              {restaurant?.logoUrl ? (
                <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )}
            </div>
          </div>

          {/* STOL badge */}
          {tableFromUrl && (
            <div className="flex justify-center mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                STOL #{tableFromUrl}
              </span>
            </div>
          )}

          <div className="px-6 pt-4 pb-6 text-center">
            <h1 className="text-2xl font-bold text-stone-800">
              Xush kelibsiz!
            </h1>
            <p className="text-stone-500 mt-1">
              {restaurant?.name
                ? `"${restaurant.name}"ning mazali taomlaridan bahramand bo‘ling.`
                : "Bizning mazali taomlarimizdan bahramand bo‘ling."}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={menuHref}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Menuni ko‘rish
              </Link>
              <Link
                href={`${menuHref}#ofitsiant`}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-stone-100 text-stone-700 font-medium rounded-xl hover:bg-stone-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Ofitsiant chaqirish
              </Link>
            </div>

            {restaurant?.promoText && (
              <div className="mt-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-left">
                <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-emerald-800">{restaurant.promoText}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
