"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import { getDictionary } from "./get-dictionary";

type Dict = ReturnType<typeof getDictionary>;

const LocaleContext = createContext<{ locale: Locale; dict: Dict } | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const dict = useMemo(() => getDictionary(locale), [locale]);
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx.locale;
}

export function useTranslations() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useTranslations must be used within LocaleProvider");
  const { dict } = ctx;
  return function t(path: string): string {
    const keys = path.split(".");
    let current: unknown = dict;
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }
    return typeof current === "string" ? current : path;
  };
}
