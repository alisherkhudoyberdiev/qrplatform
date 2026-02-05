"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/locale-context";

const TABLE_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export default function SubdomainQRPage() {
  const locale = useLocale();
  const [origin, setOrigin] = useState("");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const qrImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  // On subdomain, root welcome URL is origin/locale (e.g. https://oshxona.qrplatform.uz/uz)
  const menuUrl = origin
    ? selectedTable
      ? `${origin}/${locale}?table=${selectedTable}`
      : `${origin}/${locale}`
    : "";

  const qrApiUrl = menuUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(menuUrl)}`
    : "";

  const downloadQr = () => {
    if (!qrImgRef.current?.src) return;
    fetch(qrImgRef.current.src)
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = selectedTable
          ? `menu-stol-${selectedTable}.png`
          : "menu-qr.png";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(console.error);
  };

  const prefix = `/${locale}`;
  const menuLink = `${prefix}/menu`;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto p-6 print:max-w-none">
        <Link
          href={menuLink}
          className="text-emerald-600 font-medium mb-4 inline-block print:hidden"
        >
          ← Menyu
        </Link>
        <h1 className="text-xl font-semibold text-stone-800 mb-2">
          Menyu QR kodi
        </h1>
        <p className="text-sm text-stone-500 mb-6 print:mb-4">
          Stol tanlansa mijoz avval "Xush kelibsiz" ekranini ko'radi. QR yoki havolani chop eting.
        </p>

        <div className="mb-6 print:mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Stol raqami (1–20)
          </label>
          <div className="flex flex-wrap gap-2">
            {TABLE_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedTable(selectedTable === n ? null : n)}
                className={`w-10 h-10 rounded-lg border text-sm font-medium ${
                  selectedTable === n
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white border-stone-300 text-stone-700 hover:bg-stone-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-2">
            {selectedTable
              ? `Tanlangan: Stol ${selectedTable}`
              : "Umumiy menyu (stol tanlanmagan)"}
          </p>
        </div>

        {qrApiUrl ? (
          <div
            id="qr-print-area"
            className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm print:shadow-none print:border print:p-4"
          >
            <div className="flex flex-col items-center">
              <img
                ref={qrImgRef}
                src={qrApiUrl}
                alt="QR code"
                className="w-64 h-64 border border-stone-200 rounded-lg bg-white p-2 print:w-48 print:h-48"
              />
              <p className="mt-4 text-sm text-stone-600 break-all text-center max-w-full">
                {menuUrl}
              </p>
              {selectedTable && (
                <p className="mt-2 font-medium text-stone-800">
                  Stol {selectedTable}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6 justify-center print:hidden">
              <button
                type="button"
                onClick={downloadQr}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                Yuklab olish (PNG)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 font-medium"
              >
                Chop etish
              </button>
            </div>
          </div>
        ) : (
          <p className="text-stone-500">Yuklanmoqda...</p>
        )}
      </div>
    </div>
  );
}
