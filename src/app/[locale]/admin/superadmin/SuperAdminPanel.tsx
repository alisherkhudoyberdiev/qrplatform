"use client";

// SuperAdmin: list restaurants, create restaurant, create admin per restaurant
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Restaurant = {
  id: string;
  name: string;
  createdAt: string;
  _count?: { adminUsers: number; orders: number };
};

export function SuperAdminPanel() {
  const params = useParams();
  const locale = (params?.locale as string) || "uz";
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [addAdminFor, setAddAdminFor] = useState<string | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [switchTo, setSwitchTo] = useState<string | null>(null);

  const fetchRestaurants = () => {
    fetch("/api/admin/superadmin/restaurants")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRestaurants(data);
        else setRestaurants([]);
      })
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const createRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    fetch("/api/admin/superadmin/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setNewName("");
          fetchRestaurants();
        } else alert(data.error || "Xatolik");
      })
      .catch(() => alert("Xatolik"))
      .finally(() => setCreating(false));
  };

  const createAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAdminFor || !addEmail.trim() || !addPassword) return;
    setAdding(true);
    fetch("/api/admin/superadmin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: addAdminFor,
        email: addEmail.trim(),
        password: addPassword,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setAddAdminFor(null);
          setAddEmail("");
          setAddPassword("");
          fetchRestaurants();
        } else alert(data.error || "Xatolik");
      })
      .catch(() => alert("Xatolik"))
      .finally(() => setAdding(false));
  };

  const switchToRestaurant = (restaurantId: string) => {
    setSwitchTo(restaurantId);
    fetch("/api/admin/superadmin/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) window.location.href = `/${locale}/admin/dashboard`;
        else alert(data.error || "Xatolik");
      })
      .catch(() => alert("Xatolik"))
      .finally(() => setSwitchTo(null));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-stone-800 mb-2">
        Superadmin paneli
      </h1>
      <p className="text-stone-500 text-sm mb-6">
        Barcha restoranlar, yangi restoran va adminlar
      </p>

      {/* Create restaurant */}
      <section className="bg-white rounded-xl border border-stone-200 p-4 mb-6 shadow-sm">
        <h2 className="text-lg font-medium text-stone-700 mb-3">
          Yangi restoran qo&apos;shish
        </h2>
        <form onSubmit={createRestaurant} className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Restoran nomi"
            className="flex-1 min-w-[200px] px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {creating ? "..." : "Qo&apos;shish"}
          </button>
        </form>
      </section>

      {/* List restaurants */}
      <section className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
        <h2 className="text-lg font-medium text-stone-700 p-4 border-b border-stone-200">
          Restoranlar ({restaurants.length})
        </h2>
        {loading ? (
          <p className="p-4 text-stone-500">Yuklanmoqda...</p>
        ) : restaurants.length === 0 ? (
          <p className="p-4 text-stone-500">Restoran yo&apos;q</p>
        ) : (
          <ul className="divide-y divide-stone-200">
            {restaurants.map((r) => (
              <li key={r.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-medium text-stone-800">{r.name}</span>
                    <span className="ml-2 text-sm text-stone-500">
                      ID: {r.id.slice(0, 8)}…
                    </span>
                    {r._count != null && (
                      <span className="ml-2 text-sm text-stone-500">
                        • Admin: {r._count.adminUsers} • Buyurtma:{" "}
                        {r._count.orders}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href={`/${locale}/menu/${r.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Menyu
                    </Link>
                    <button
                      type="button"
                      onClick={() => switchToRestaurant(r.id)}
                      disabled={!!switchTo}
                      className="text-sm px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 disabled:opacity-50"
                    >
                      {switchTo === r.id ? "..." : "Restoranga kirish"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAddAdminFor(addAdminFor === r.id ? null : r.id)
                      }
                      className="text-sm px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200"
                    >
                      Admin qo&apos;shish
                    </button>
                  </div>
                </div>
                {addAdminFor === r.id && (
                  <form
                    onSubmit={createAdmin}
                    className="mt-3 pt-3 border-t border-stone-200 flex flex-wrap gap-2 items-end"
                  >
                    <input
                      type="email"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      placeholder="Email"
                      required
                      className="px-3 py-2 border border-stone-300 rounded-lg w-48"
                    />
                    <input
                      type="password"
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      placeholder="Parol"
                      required
                      className="px-3 py-2 border border-stone-300 rounded-lg w-40"
                    />
                    <button
                      type="submit"
                      disabled={adding}
                      className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                    >
                      {adding ? "..." : "Yaratish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddAdminFor(null);
                        setAddEmail("");
                        setAddPassword("");
                      }}
                      className="px-3 py-2 text-stone-600 hover:text-stone-800"
                    >
                      Bekor
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-stone-500 mt-4">
        Seed: superadmin@qrplatform.uz / super123
      </p>
    </div>
  );
}
