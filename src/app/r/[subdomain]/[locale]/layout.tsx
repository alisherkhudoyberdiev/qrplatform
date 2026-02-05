import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LocaleProvider } from "@/i18n/locale-context";
import { isValidLocale, type Locale } from "@/i18n/config";
import { SetLocaleLang } from "@/app/[locale]/SetLocaleLang";
import { RestaurantProvider } from "@/contexts/RestaurantContext";

const localeToLang: Record<Locale, string> = {
  uz: "uz",
  ru: "ru",
  en: "en",
};

export default async function SubdomainLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const restaurant = await prisma.restaurant.findUnique({
    where: { subdomain: subdomain.toLowerCase() },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      coverImageUrl: true,
      promoText: true,
    },
  });
  if (!restaurant) notFound();

  const lang = localeToLang[locale as Locale];

  return (
    <LocaleProvider locale={locale as Locale}>
      <RestaurantProvider
        restaurantId={restaurant.id}
        restaurant={{
          id: restaurant.id,
          name: restaurant.name,
          logoUrl: restaurant.logoUrl,
          coverImageUrl: restaurant.coverImageUrl,
          promoText: restaurant.promoText,
        }}
      >
        <SetLocaleLang lang={lang} />
        {children}
      </RestaurantProvider>
    </LocaleProvider>
  );
}
