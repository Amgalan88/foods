"use client";
import { useState } from "react";

const formatter = new Intl.DateTimeFormat("mn-MN", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const statusStyles = {
  pending: "bg-red-50 text-red-700 border-red-300",
  paid: "bg-blue-50 text-blue-700 border-blue-300",
  preparing: "bg-purple-50 text-purple-700 border-purple-300",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-300",
  cancelled: "bg-gray-100 text-gray-600 border-gray-300",
};

export default function OrderTable({
  orders,
  loading,
  error,
  statusOptions = [],
  onStatusChange,
  updatingOrderId,
  selectedMap = {},
  onToggleSelect,
  onToggleSelectAll,
  page = 1,
  perPage = 1,
}) {
  const [activeOrderItems, setActiveOrderItems] = useState(null);
  const allSelected =
    !!orders?.length && orders.every((order) => selectedMap[order._id]);
  const startIndex = (page - 1) * perPage;

  return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto px-4 pb-6">
        {error ? (
          <p className="text-sm text-red-600 px-2 py-3">{error}</p>
        ) : loading ? (
          <p className="text-sm text-gray-500 px-2 py-4">Loading orders…</p>
        ) : !orders?.length ? (
          <p className="text-sm text-gray-500 px-2 py-4">
            No orders match your filters yet.
          </p>
        ) : (
          <table className="min-w-full border-separate border-spacing-y-3 text-sm text-gray-900">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500">
                <th className="text-left px-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-gray-900"
                    checked={!!allSelected}
                    onChange={(event) =>
                      onToggleSelectAll?.(event.target.checked, orders)
                    }
                  />
                </th>
                <th className="text-left px-3">№</th>
                <th className="text-left px-3">Customer</th>
                <th className="text-left px-3">Food</th>
                <th className="text-left px-3">Date</th>
                <th className="text-left px-3">Total</th>
                <th className="text-left px-3">Delivery address</th>
                <th className="text-left px-3">Delivery state</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const firstItem = order.items?.[0];
                const moreItems = Math.max((order.items?.length || 0) - 1, 0);
                const displayIndex = startIndex + index + 1;

                return (
                  <tr
                    key={order._id ?? index}
                    className="bg-gray-50 rounded-2xl shadow-sm"
                  >
                    <td className="rounded-l-2xl px-3 py-3 align-top">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-gray-900"
                        checked={!!selectedMap[order._id]}
                        onChange={(event) =>
                          onToggleSelect?.(order._id, event.target.checked)
                        }
                      />
                    </td>
                    <td className="px-3 py-3 align-top text-gray-500">
                      {String(displayIndex).padStart(2, "0")}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium">{order?.user?.name || "—"}</p>
                      <p className="text-xs text-gray-500">
                        {order?.user?.email || order?.user?.phone || "-"}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-center gap-3">
                        <div
                          className="cursor-pointer h-12 w-12 overflow-hidden rounded-xl bg-white"
                          onClick={() => setActiveOrderItems(order.items)}
                        >
                          {firstItem?.food?.image ? (
                            <img
                              src={firstItem.food.image}
                              alt={firstItem.food?.foodname || "Dish"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-medium">
                            {firstItem?.food?.foodname || "Untitled"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {firstItem ? `× ${firstItem.quantity}` : "No items"}
                            {moreItems > 0 ? ` · +${moreItems} more` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      {order.createdAt
                        ? formatter.format(new Date(order.createdAt))
                        : "—"}
                    </td>
                    <td className="px-3 py-3 align-top font-semibold">
                      {(order.totalPrice || 0).toLocaleString("mn-MN")} ₮
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-gray-600">
                      {order.deliveryAddress || "Pick up"}
                    </td>
                    <td className="rounded-r-2xl px-3 py-3 align-top">
                      {typeof onStatusChange === "function" ? (
                        <select
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[order.status] ?? "bg-gray-100 text-gray-700"}`}
                          value={order.status}
                          onChange={(event) =>
                            onStatusChange(order._id, event.target.value)
                          }
                          disabled={updatingOrderId === order._id}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[order.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {order.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {activeOrderItems && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Ordered Items
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeOrderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm text-gray-800"
                  >
                    <span>{item.food?.foodname || "Dish"}</span>
                    <span className="font-semibold">× {item.quantity}</span>
                  </div>
                ))}
              </div>

              <button
                className="mt-6 w-full rounded-xl bg-gray-900 text-white py-2 font-semibold"
                onClick={() => setActiveOrderItems(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
