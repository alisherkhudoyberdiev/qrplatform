"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const logout = () => {
    fetch("/api/admin/logout", { method: "POST" })
      .then(() => {
        const locale = window.location.pathname.split("/")[1] || "uz";
        router.push(`/${locale}/admin/login`);
        router.refresh();
      });
  };
  return (
    <button
      type="button"
      onClick={logout}
      className="ml-auto text-sm text-stone-500 hover:text-stone-700"
    >
      Chiqish
    </button>
  );
}
