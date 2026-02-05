import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isValidLocale } from "./i18n/config";

const RESERVED_SUBDOMAINS = new Set([
  "www", "api", "admin", "app", "superadmin", "next", "static", "r",
]);

function getSubdomain(request: NextRequest): string | null {
  const host = request.headers.get("host") || request.nextUrl.hostname || "";
  const hostname = host.replace(/:\d+$/, ""); // strip port
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN; // e.g. "qrplatform.uz"

  if (hostname === "localhost") return null;
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.split(".")[0];
    return sub && !RESERVED_SUBDOMAINS.has(sub) ? sub : null;
  }
  if (rootDomain && hostname === rootDomain) return null;
  if (rootDomain && hostname.endsWith("." + rootDomain)) {
    const prefix = hostname.slice(0, hostname.length - rootDomain.length - 1);
    const sub = prefix.split(".")[0];
    return sub && !RESERVED_SUBDOMAINS.has(sub) ? sub : null;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // API and static assets: skip
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }
  // Already rewritten subdomain route
  if (pathname.startsWith("/r/")) {
    return NextResponse.next();
  }

  const subdomain = getSubdomain(request);
  if (subdomain) {
    const segments = pathname.split("/").filter(Boolean);
    let locale = defaultLocale;
    let rest = "";
    if (segments.length > 0 && isValidLocale(segments[0])) {
      locale = segments[0];
      rest = segments.slice(1).join("/");
    } else {
      rest = segments.join("/");
    }
    const rewritePath = `/r/${subdomain}/${locale}${rest ? `/${rest}` : ""}`;
    const url = new URL(rewritePath, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.rewrite(url);
  }

  // No subdomain: locale redirect
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isValidLocale(segments[0])) {
    return NextResponse.next();
  }
  const newUrl = new URL(`/${defaultLocale}${pathname === "/" ? "" : pathname}`, request.url);
  newUrl.search = request.nextUrl.search;
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
