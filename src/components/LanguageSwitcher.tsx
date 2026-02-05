"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  // pathname is like /uz or /uz/admin/login - remove locale segment to get base path
  const segments = pathname.split("/").filter(Boolean);
  const basePath = segments.length > 1 ? "/" + segments.slice(1).join("/") : "";

  return (
    <div className="flex items-center gap-1" role="navigation" aria-label="Tilni tanlash">
      {locales.map((loc) => (
        <Link
          key={loc}
          href={loc === defaultLocale && basePath === "" ? "/uz" : `/${loc}${basePath}`}
          className={`px-2 py-1 rounded text-sm font-medium ${
            loc === currentLocale
              ? "bg-amber-100 text-amber-800"
              : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
          }`}
          aria-current={loc === currentLocale ? "true" : undefined}
        >
          {localeNames[loc]}
        </Link>
      ))}
    </div>
  );
}

const defaultLocale: Locale = "uz";
