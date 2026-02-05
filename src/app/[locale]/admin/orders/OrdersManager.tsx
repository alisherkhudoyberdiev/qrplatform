"use client";

// Admin orders: tabs by status, highlight NEW, table + note, 1-click status, auto-refresh
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

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

const statuses = ["new", "preparing", "ready"] as const;
const NEW_ORDER_THRESHOLD_MS = 2 * 60 * 1000; // 2 min = "new" badge

function formatPrice(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(n) + " so‘m";
}

function isNewOrder(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < NEW_ORDER_THRESHOLD_MS;
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const fetchOrders = () => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((list: Order[]) => {
        setOrders(list);
        const currentIds = new Set(list.map((o) => o.id));
        const newlyAdded = list.filter((o) => !prevOrderIdsRef.current.has(o.id));
        prevOrderIdsRef.current = currentIds;
        if (newlyAdded.length > 0) {
          setNewOrderIds((prev) => new Set([...prev, ...newlyAdded.map((o) => o.id)]));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = (orderId: string, status: string) => {
    fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((r) => r.json())
      .then((updated) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
        );
        setNewOrderIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      })
      .catch(console.error);
  };

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  if (loading && orders.length === 0) {
    return (
      <div className="flex gap-2 animate-pulse">
        <div className="h-9 w-20 bg-stone-200 rounded" />
        <div className="h-9 w-28 bg-stone-200 rounded" />
        <div className="h-9 w-24 bg-stone-200 rounded" />
        <p className="text-stone-500 ml-4">Yuklanmoqda...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return <p className="text-stone-500">Buyurtmalar yo‘q.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-stone-500 mr-2">Har 5 soniyada yangilanadi.</span>
        <div className="flex gap-1 p-1 bg-stone-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              activeTab === "all"
                ? "bg-white text-stone-800 shadow"
                : "text-stone-600 hover:bg-white/50"
            }`}
          >
            Barchasi
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveTab(s)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${
                activeTab === s
                  ? "bg-white text-stone-800 shadow"
                  : "text-stone-600 hover:bg-white/50"
              }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-4">
        {filteredOrders.map((o) => {
          const isNew = newOrderIds.has(o.id) || isNewOrder(o.createdAt);
          return (
            <li
              key={o.id}
              id={highlightId === o.id ? "highlight" : undefined}
              className={`bg-white rounded-lg border p-4 shadow-sm ${
                highlightId === o.id
                  ? "ring-2 ring-emerald-500"
                  : isNew
                    ? "border-amber-400 ring-1 ring-amber-200"
                    : "border-stone-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-stone-500">
                    #{o.id.slice(-8)}
                  </span>
                  {isNew && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded">
                      YANGI
                    </span>
                  )}
                  {o.tableNumber && (
                    <span className="px-2 py-0.5 bg-stone-200 text-stone-700 text-xs rounded">
                      Stol {o.tableNumber}
                    </span>
                  )}
                </div>
                <span className="text-sm text-stone-500">
                  {new Date(o.createdAt).toLocaleString("uz-UZ")}
                </span>
              </div>

              {o.note && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">
                  Izoh: {o.note}
                </p>
              )}

              <ul className="mb-3 text-stone-700 text-sm">
                {o.items.map((i, idx) => (
                  <li key={idx}>
                    {i.menuItem.name} × {i.quantity} —{" "}
                    {formatPrice(i.menuItem.price * i.quantity)}
                  </li>
                ))}
              </ul>
              <p className="font-medium text-stone-800 mb-3">
                Jami: {formatPrice(o.total)}
              </p>

              <div className="flex gap-2 flex-wrap">
                {statuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateStatus(o.id, s)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                      o.status === s
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
