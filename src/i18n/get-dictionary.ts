import type { Locale } from "./config";
import { uz } from "./messages/uz";
import { ru } from "./messages/ru";
import { en } from "./messages/en";

type DictShape = typeof uz;
const dictionaries = { uz, ru, en } as unknown as Record<Locale, DictShape>;

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.uz;
}

// Helper: get nested value by path "landing.heroTitle"
export function getNested(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}
