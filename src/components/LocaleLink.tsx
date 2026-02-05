"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/locale-context";

type Props = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function LocaleLink({ href, ...rest }: Props) {
  const locale = useLocale();
  const path = href.startsWith("/") ? href : `/${href}`;
  const localeHref = path.startsWith(`/${locale}/`) || path === `/${locale}` ? path : `/${locale}${path === "/" ? "" : path}`;
  return <Link href={localeHref} {...rest} />;
}
