import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const l = (path: string) => {
    const keys = path.split(".");
    let cur: unknown = t;
    for (const k of keys) cur = cur && typeof cur === "object" && k in cur ? (cur as Record<string, unknown>)[k] : path;
    return typeof cur === "string" ? cur : path;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white/95 backdrop-blur border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={`/${locale}`} className="font-bold text-xl text-stone-900">
            {l("landing.brand")}
          </Link>
          <nav className="flex items-center gap-6">
            <Link href={`/${locale}#imkoniyatlar`} className="text-stone-600 hover:text-stone-900 text-sm font-medium hidden sm:inline">
              {l("landing.navFeatures")}
            </Link>
            <Link href={`/${locale}#qanday`} className="text-stone-600 hover:text-stone-900 text-sm font-medium hidden sm:inline">
              {l("landing.navHow")}
            </Link>
            <Link href={`/${locale}/demo`} className="text-stone-600 hover:text-stone-900 text-sm font-medium">
              {l("landing.navDemo")}
            </Link>
            <Link href={`/${locale}/admin/login`} className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition">
              {l("landing.navLogin")}
            </Link>
            <LanguageSwitcher currentLocale={locale} />
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-wide mb-3">{l("landing.heroBadge")}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-5">
            {l("landing.heroTitle")} <span className="text-amber-500">{l("landing.heroTitleAccent")}</span>
          </h1>
          <p className="text-lg text-stone-600 mb-8">{l("landing.heroSub")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/demo`} className="px-8 py-4 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition text-center">
              {l("landing.ctaTry")}
            </Link>
            <Link href={`/${locale}/admin/login`} className="px-8 py-4 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition text-center">
              {l("landing.ctaAdmin")}
            </Link>
          </div>
          <p className="text-sm text-stone-500 mt-4">{l("landing.ctaHint")}</p>
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            [t.landing.stat1Value, t.landing.stat1Label],
            [t.landing.stat2Value, t.landing.stat2Label],
            [t.landing.stat3Value, t.landing.stat3Label],
            [t.landing.stat4Value, t.landing.stat4Label],
          ].map(([value, label]) => (
            <div key={label} className="bg-white rounded-xl border border-stone-200 p-4 text-center shadow-sm">
              <p className="font-bold text-stone-900">{value}</p>
              <p className="text-xs text-stone-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-stone-200 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">{l("landing.problemTitle")}</h2>
          <p className="text-stone-600 max-w-2xl mx-auto">{l("landing.problemSub")}</p>
        </div>
      </section>

      <section id="imkoniyatlar" className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-center mb-4">{l("landing.whyTitle")}</h2>
        <p className="text-stone-600 text-center max-w-xl mx-auto mb-12">{l("landing.whySub")}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            [t.landing.card1Title, t.landing.card1Desc, "amber"],
            [t.landing.card2Title, t.landing.card2Desc, "stone"],
            [t.landing.card3Title, t.landing.card3Desc, "stone"],
          ].map(([title, desc, color]) => (
            <div key={title} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md hover:border-stone-300 transition">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color === "amber" ? "bg-amber-100" : "bg-stone-100"}`}>
                <svg className={`w-6 h-6 ${color === "amber" ? "text-amber-600" : "text-stone-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="qanday" className="bg-stone-100 border-y border-stone-200 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-center mb-4">{l("landing.howTitle")}</h2>
          <p className="text-stone-600 text-center max-w-xl mx-auto mb-12">{l("landing.howSub")}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              [t.landing.step1Title, t.landing.step1Text],
              [t.landing.step2Title, t.landing.step2Text],
              [t.landing.step3Title, t.landing.step3Text],
            ].map(([title, text], i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm h-full">
                <span className="inline-flex w-10 h-10 rounded-full bg-amber-500 text-white font-bold items-center justify-center text-lg">{i + 1}</span>
                <h3 className="font-semibold text-stone-900 mt-4 mb-2">{title}</h3>
                <p className="text-stone-500 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="bg-stone-900 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{l("landing.ctaBlockTitle")}</h2>
          <p className="text-stone-300 mb-8 max-w-lg mx-auto">{l("landing.ctaBlockSub")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/demo`} className="px-8 py-4 bg-amber-500 text-stone-900 font-semibold rounded-xl hover:bg-amber-400 transition">
              {l("landing.ctaTry")}
            </Link>
            <Link href={`/${locale}/admin/login`} className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition">
              {l("admin.panel")}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-xl font-bold text-stone-900 text-center mb-8">{l("landing.faqTitle")}</h2>
        <dl className="space-y-6">
          {[
            [t.landing.faq1Q, t.landing.faq1A],
            [t.landing.faq2Q, t.landing.faq2A],
            [t.landing.faq3Q, t.landing.faq3A],
          ].map(([q, a]) => (
            <div key={q} className="bg-white rounded-xl border border-stone-200 p-4">
              <dt className="font-semibold text-stone-900">{q}</dt>
              <dd className="text-stone-500 text-sm mt-1">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="border-t border-stone-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href={`/${locale}`} className="font-bold text-lg text-stone-900">
            {l("landing.brand")}
          </Link>
          <div className="flex gap-6 text-sm">
            <Link href={`/${locale}#imkoniyatlar`} className="text-stone-500 hover:text-stone-700">{l("landing.navFeatures")}</Link>
            <Link href={`/${locale}#qanday`} className="text-stone-500 hover:text-stone-700">{l("landing.navHow")}</Link>
            <Link href={`/${locale}/demo`} className="text-stone-500 hover:text-stone-700">{l("landing.navDemo")}</Link>
            <Link href={`/${locale}/admin/login`} className="text-stone-500 hover:text-stone-700">{l("landing.navLogin")}</Link>
          </div>
          <LanguageSwitcher currentLocale={locale} />
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-4 pt-4 border-t border-stone-100 text-center text-sm text-stone-500">
          {l("landing.footerTagline")}
        </div>
      </footer>
    </div>
  );
}
