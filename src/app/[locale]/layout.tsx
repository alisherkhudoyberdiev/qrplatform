import React from "react";
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/i18n/locale-context";
import { isValidLocale, type Locale } from "@/i18n/config";
import { SetLocaleLang } from "./SetLocaleLang";

const localeToLang: Record<Locale, string> = {
  uz: "uz",
  ru: "ru",
  en: "en",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const lang = localeToLang[locale as Locale];

  return (
    <LocaleProvider locale={locale as Locale}>
      <SetLocaleLang lang={lang} />
      {children}
    </LocaleProvider>
  );
}
