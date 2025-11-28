// src/features/order/OrderBar.jsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import OrderTable from "@/app/_components/orders";
import RangeCalendar from "@/components/ui/range";
import { API_BASE_URL, buildAuthHeaders } from "@/lib/api";

// Захиалгын статусын filter-ийн сонголтууд
const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "preparing", label: "Preparing" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

// Dropdown дээр хэрэглэгдэх “all”-гүй хувилбар (status update хийхэд)
const ORDER_STATUS_OPTIONS = STATUS_FILTERS.filter(
  (option) => option.value !== "all"
);

// Нэг хуудсанд харуулах захиалгын тоо (pagination size)
const ORDERS_PER_PAGE = 15;

export default function OrderBar() {
  // Бүх захиалгууд (filter-тэй нийлсэн data)
  const [orders, setOrders] = useState([]);
  // Table ачааллаж байна уу (Loading state)
  const [loading, setLoading] = useState(false);
  // Fetch дээрх алдааны мессеж
  const [error, setError] = useState("");
  // Статусын filter (all, pending, paid, ...)
  const [statusFilter, setStatusFilter] = useState("all");
  // Огнооны range filter (from–to)
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const fromDate = dateRange.from;
  const toDate = dateRange.to;
  // Action (status update, bulk update) алдаа
  const [actionError, setActionError] = useState("");
  // Аль order update хийж байгааг тэмдэглэх (loading state per row)
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  // Checkbox–оор сонгосон захиалгуудын map: {orderId: true/false}
  const [selectedOrders, setSelectedOrders] = useState({});
  // Bulk status update хийхэд сонгох статус
  const [bulkStatus, setBulkStatus] = useState("pending");
  // Одоогийн хуудас (pagination)
  const [page, setPage] = useState(1);

  // Захиалгуудыг backend-ээс татах функц
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      // Статус filter нь all биш бол query-д нэмнэ
      if (statusFilter !== "all") params.set("status", statusFilter);
      // Огнооны range байвал ISO string болгож query-д нэмнэ
      if (fromDate) params.set("from", fromDate.toISOString());
      if (toDate) params.set("to", toDate.toISOString());

      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/orders${query}`, {
        headers: buildAuthHeaders(), // Admin JWT header
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load orders.");
      }

      // Амжилттай ирвэл массив гэдгийг шалгаад state-д суулгана
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, fromDate, toDate]);

  // Component mount болоход болон filter өөрчлөгдөхөд orders fetch хийнэ
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Статус, огнооны filter солигдоход хуудасыг 1 рүү reset хийнэ
  useEffect(() => {
    setPage(1);
  }, [statusFilter, fromDate, toDate]);

  // Нийт хэдэн хуудас болохыг тооцоолно
  const totalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));

  // Filter солигдож, orders.length багассанаас page нь totalPages-ээс хэтэрсэн бол засна
  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  // Одоогийн хуудсыг slice хийх offset
  const offset = (page - 1) * ORDERS_PER_PAGE;
  // Тухайн хуудсанд харагдах orders (frontend pagination)
  const visibleOrders = orders.slice(offset, offset + ORDERS_PER_PAGE);

  // Нэг захиалтын статус өөрчлөх handler
  const handleStatusChange = async (orderId, nextStatus) => {
    if (!orderId || !nextStatus) return;
    setActionError("");
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "PATCH",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update order.");
      }

      // Амжилттай бол дахин orders fetch хийнэ (шинэчилсэн list)
      await fetchOrders();
    } catch (err) {
      setActionError(err.message || "Failed to update order.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filter-үүдийг reset хийх (статус + огноо)
  const handleResetFilters = () => {
    setDateRange({ from: null, to: null });
    setStatusFilter("all");
    setActionError("");
    fetchOrders();
  };

  // Нэг мөрийн checkbox–ийг toggle хийх
  const handleToggleSelect = (orderId, checked) => {
    setSelectedOrders((prev) => ({ ...prev, [orderId]: checked }));
  };

  // Харагдаж байгаа хуудсын бүх захиалгыг сонгох/чөлөөлөх (select all)
  const handleToggleSelectAll = (checked, currentOrders = []) => {
    if (!currentOrders.length) return;
    setSelectedOrders((prev) => {
      const next = { ...prev };
      if (checked) {
        // Check хийвэл тухайн хуудсын бүх order-ийг сонгосон болгон тэмдэглэнэ
        currentOrders.forEach((order) => {
          next[order._id] = true;
        });
      } else {
        // Uncheck хийвэл тухайн хуудсын бүх order-ийг selected-оос хасна
        currentOrders.forEach((order) => {
          delete next[order._id];
        });
      }
      return next;
    });
  };

  // Сонгогдсон бүх order ID-гийн массив (bulk update-д ашиглана)
  const selectedIds = useMemo(
    () =>
      Object.entries(selectedOrders)
        .filter(([, val]) => val)
        .map(([id]) => id),
    [selectedOrders]
  );

  // Сонгогдсон бүх захиалтын статусыг bulkStatus болгож шинэчлэх
  const handleBulkStatusChange = async () => {
    if (!selectedIds.length) return;
    setActionError("");
    try {
      // Бүх сонгогдсон ID–д PATCH request зэрэг илгээнэ
      await Promise.all(
        selectedIds.map((orderId) =>
          fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: "PATCH",
            headers: buildAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ status: bulkStatus }),
          })
        )
      );
      // Сонголтуудыг цэвэрлээд, дахин orders татна
      setSelectedOrders({});
      await fetchOrders();
    } catch (err) {
      setActionError(err.message || "Failed to update selected orders.");
    }
  };

  // Pagination товч дарахад дуудна (Prev/Next, page number)
  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  // Доод талын pagination товчлууруудад харагдах page list (1 ... 4 5 [6] 7 8 ... 20 гэх мэт)
  const paginationItems = useMemo(() => {
    if (totalPages <= 10) {
      // Хэрвээ 10-аас цөөн хуудастай бол бүгдийг нь дарааллаар нь харуулна
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    // Олон хуудсанд 1, last, ойр хавийнуудаар нь л гаргана, хооронд нь ... тавина
    const base = new Set([
      1,
      totalPages,
      page,
      page - 1,
      page + 1,
      page - 2,
      page + 2,
    ]);
    const sorted = Array.from(base)
      .filter((num) => num >= 1 && num <= totalPages)
      .sort((a, b) => a - b);

    const output = [];
    sorted.forEach((num, idx) => {
      if (idx > 0) {
        const prev = sorted[idx - 1];
        // Хооронд нь алгассан page байвал ... нэмнэ
        if (num - prev > 1) {
          output.push(null); // null = ellipsis
        }
      }
      output.push(num);
    });
    return output;
  }, [page, totalPages]);

  return (
    <div className="flex-1 bg-[#f7f5f2] min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="rounded-8 border border-gray-200 bg-white shadow-2xl">
          {/* Header хэсэг: гарчиг + filter-үүд */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b px-8 py-6">
            <div>
              <p className="text-xl font-semibold text-gray-900">Orders</p>
              <p className="text-sm text-gray-500">{orders.length} items</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Огнооны range calendar filter */}
              <RangeCalendar value={dateRange} onChange={setDateRange} />
              {/* Статус filter dropdown */}
              <select
                className="rounded-full border border-gray-300 px-4 py-2 text-sm"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {/* Bulk status сонгох dropdown */}
              <select
                className="rounded-full border border-gray-300 px-4 py-2 text-sm"
                value={bulkStatus}
                onChange={(event) => setBulkStatus(event.target.value)}
              >
                {ORDER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {/* Bulk status update button */}
              <button
                type="button"
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-60"
                onClick={handleBulkStatusChange}
                disabled={!selectedIds.length}
              >
                Change delivery state
                {selectedIds.length ? ` (${selectedIds.length})` : ""}
              </button>
              {/* Filter reset button */}
              <button
                type="button"
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600"
                onClick={handleResetFilters}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Action алдаа (status update гэх мэт) */}
          {actionError ? (
            <p className="px-8 pt-4 text-sm text-red-600">{actionError}</p>
          ) : null}

          {/* Orders table хэсэг */}
          <div className="px-4 pb-6">
            <OrderTable
              orders={visibleOrders} // Зөвхөн энэ хуудсын захиалгууд
              loading={loading}
              error={error}
              statusOptions={ORDER_STATUS_OPTIONS}
              onStatusChange={handleStatusChange}
              updatingOrderId={updatingOrderId}
              selectedMap={selectedOrders}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              page={page}
              perPage={ORDERS_PER_PAGE}
            />
          </div>

          {/* Доод талын pagination + статистик */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t px-8 py-4 text-sm text-gray-600">
            <span>
              Showing {visibleOrders.length || 0} of {orders.length} results ·
              Page {page}/{totalPages}
            </span>
            <div className="flex items-center gap-2 text-gray-700">
              {/* Previous товч */}
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium disabled:opacity-40"
              >
                ‹
              </button>
              {/* Дунд нь page товчнууд (1 … 4 5 [6] 7 8 … 20) */}
              {paginationItems.map((item, idx) =>
                item === null ? (
                  <span key={`ellipsis-${idx}`} className="px-1">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePageChange(item)}
                    className={`min-w-8 rounded-full border px-3 py-1 text-xs font-semibold ${
                      page === item
                        ? "border-gray-900 text-gray-900"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
              {/* Next товч */}
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
