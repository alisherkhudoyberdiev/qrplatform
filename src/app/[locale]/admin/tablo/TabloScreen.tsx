"use client";

// Tablo: 3 ustun (Yangi, Tayyorlanmoqda, Tayyor), katta kartochkalar, avtomatik yangilanish
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type OrderItem = {
  menuItem: { name: string; price: number };
  quantity: number;
};

type Order = {
  id: string;
  status: string;
  createdAt: string;
  tableNumber?: string | null;
  note?: string | null;
  items: OrderItem[];
  total: number;
};

const statusLabels: Record<string, string> = {
  new: "Yangi",
  preparing: "Tayyorlanmoqda",
  ready: "Tayyor",
};

const COLUMNS = [
  { key: "new", label: "Yangi", bg: "bg-amber-500/20", border: "border-amber-500", headBg: "bg-amber-500" },
  { key: "preparing", label: "Tayyorlanmoqda", bg: "bg-blue-500/20", border: "border-blue-500", headBg: "bg-blue-500" },
  { key: "ready", label: "Tayyor", bg: "bg-emerald-500/20", border: "border-emerald-500", headBg: "bg-emerald-500" },
];

function formatTime(createdAt: string) {
  const d = new Date(createdAt);
  return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

export default function TabloScreen() {
  const params = useParams();
  const locale = (params?.locale as string) || "uz";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((list: Order[]) => setOrders(list))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <p className="text-stone-400 text-xl">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Buyurtmalar tablosi
        </h1>
        <div className="flex items-center gap-2 text-stone-400 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
          <span>Har 4 soniyada yangilanadi</span>
        </div>
        <Link
          href={`/${locale}/admin/orders`}
          className="text-sm text-amber-400 hover:text-amber-300 font-medium"
        >
          Boshqaruv →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {COLUMNS.map((col) => {
          const columnOrders = orders.filter((o) => o.status === col.key);
          return (
            <div
              key={col.key}
              className={`rounded-2xl border-2 ${col.border} ${col.bg} overflow-hidden flex flex-col min-h-[400px]`}
            >
              <div className={`${col.headBg} px-4 py-3 text-center`}>
                <span className="text-lg md:text-xl font-bold text-white">
                  {col.label}
                </span>
                <span className="ml-2 text-white/80 font-medium">
                  ({columnOrders.length})
                </span>
              </div>
              <div className="flex-1 p-3 md:p-4 space-y-3 overflow-auto">
                {columnOrders.length === 0 ? (
                  <p className="text-stone-500 text-center py-8 text-lg">
                    Bo‘sh
                  </p>
                ) : (
                  columnOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-stone-800/80 rounded-xl p-4 border border-stone-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono font-bold text-lg text-amber-400">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-stone-400 text-sm font-medium">
                          {formatTime(order.createdAt)}
                        </span>
                      </div>
                      {order.tableNumber && (
                        <p className="text-white font-semibold text-base mb-1">
                          Stol {order.tableNumber}
                        </p>
                      )}
                      <ul className="space-y-0.5 text-stone-300 text-sm md:text-base">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.menuItem.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                      {order.note && (
                        <p className="mt-2 text-amber-200/90 text-sm italic border-t border-stone-600 pt-2">
                          Izoh: {order.note}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
