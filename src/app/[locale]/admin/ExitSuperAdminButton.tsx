"use client";

import { useState } from "react";

export function ExitSuperAdminButton() {
  const [loading, setLoading] = useState(false);

  const exit = () => {
    setLoading(true);
    fetch("/api/admin/superadmin/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId: null }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          const locale = window.location.pathname.split("/")[1] || "uz";
          window.location.href = `/${locale}/admin/superadmin`;
        }
        else alert(data.error || "Xatolik");
      })
      .catch(() => alert("Xatolik"))
      .finally(() => setLoading(false));
  };

  return (
    <button
      type="button"
      onClick={exit}
      disabled={loading}
      className="text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
    >
      {loading ? "..." : "Superadmin paneliga qaytish"}
    </button>
  );
}
