"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import FoodsInfo from "../_components/foodsinfo";
import { API_BASE_URL, getStoredSession, buildAuthHeaders } from "@/lib/api";

const formatOrderDate = (date) =>
  new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));

const STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  preparing: "Preparing",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const STATUS_CLASSNAMES = {
  pending: "bg-red-50 text-red-700 border-red-200",
  paid: "bg-blue-50 text-blue-700 border-blue-200",
  preparing: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState({});
  const [selectionError, setSelectionError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("cart");
  const [addressInput, setAddressInput] = useState("");

  const [orderHistory, setOrderHistory] = useState([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [orderHistoryError, setOrderHistoryError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("order") === "success") {
      setSuccessMessage("Thank you! Your order is on its way.");
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "/menu");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/category`);
        if (!response.ok) throw new Error("Failed to load categories.");
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
        if (data?.length) setActiveCategoryId(data[0]._id);
      } catch (err) {
        setError(err.message || "Something went wrong while loading menu.");
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const session = getStoredSession();
    setCurrentUser(session?.user || null);
    const savedAddress = window.localStorage.getItem("nomnom_delivery_address");
    if (savedAddress) setAddressInput(savedAddress);

    const storageListener = (event) => {
      if (event.key === "nomnom_user") {
        const nextSession = event.newValue ? JSON.parse(event.newValue) : null;
        setCurrentUser(nextSession?.user || null);
      }
    };
    window.addEventListener("storage", storageListener);
    return () => window.removeEventListener("storage", storageListener);
  }, [router]);

  useEffect(() => {
    if (!currentUser) {
      setSelectedItems({});
      setOrderHistory([]);
    } else {
      setSelectionError("");
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!currentUser || drawerTab !== "order") return;
      try {
        setOrderHistoryLoading(true);
        setOrderHistoryError("");
        const response = await fetch(`${API_BASE_URL}/orders`, {
          headers: buildAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to load orders.");
        const data = await response.json();
        const filtered = Array.isArray(data)
          ? data.filter((order) => order.user?._id === currentUser._id)
          : [];
        setOrderHistory(filtered);
      } catch (err) {
        setOrderHistoryError(err.message || "Could not load your orders.");
      } finally {
        setOrderHistoryLoading(false);
      }
    };
    fetchOrderHistory();
  }, [drawerTab, currentUser]);

  const categoryButtons = useMemo(() => {
    return categories.map((category) => (
      <button
        key={category._id}
        type="button"
        onClick={() => setActiveCategoryId(category._id)}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          activeCategoryId === category._id
            ? "bg-white text-gray-900"
            : "bg-[#3b3937] text-white border border-[#4d4a48]"
        }`}
      >
        {category.category}
      </button>
    ));
  }, [categories, activeCategoryId]);

  const selectedList = Object.values(selectedItems);
  const totalPrice = selectedList.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
    0
  );

  const handleToggleSelect = (food) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setSelectionError("");
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[food._id]) delete next[food._id];
      else next[food._id] = { ...food, quantity: 1 };
      return next;
    });
  };

  const handleQuantityChange = (foodId, delta) => {
    if (!currentUser) return;
    setSelectedItems((prev) => {
      const next = { ...prev };
      const item = next[foodId];
      if (!item) return prev;
      const nextQty = Math.max(1, item.quantity + delta);
      next[foodId] = { ...item, quantity: nextQty };
      return next;
    });
  };

  const handleProceedToPayment = () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (!selectedList.length) {
      setSelectionError("Please choose at least one dish before paying.");
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("nomnom_cart", JSON.stringify(selectedList));
      if (addressInput.trim()) {
        window.localStorage.setItem(
          "nomnom_delivery_address",
          addressInput.trim()
        );
      }

      // ⬇️ router.push оронд full page navigation хийе
      window.location.href = "/payment";
      return;
    }

    // Server side ачаалж байвал fallback
    router.push("/payment");
  };

  const openDrawer = (tab) => {
    setDrawerTab(tab);
    setIsDrawerOpen(true);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("nomnom_user");
      window.localStorage.removeItem("nomnom_cart");
      router.replace("/login");
    }
  };

  return (
    <div className="bg-[#1f1d1d] min-h-screen text-white">
      <div className="flex h-42 bg-black items-center gap-2 text-white">
        <div className="ml-10 flex">
          <Image
            src="/logo.png"
            alt="NOM NOM logo"
            width={50}
            height={50}
            priority
          />
          <div className="flex flex-col items-center ml-3">
            <p>NOM NOM</p>
            <p>Swift delivery</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-100">
        <div className="relative w-full h-167">
          <Image
            src="/hover.png"
            alt="NOM NOM hero"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <section className="bg-[#2b2928] py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[#f26c4f]">
                  Menu highlights
                </p>
                <h2 className="text-3xl font-semibold text-white">
                  Explore the menu
                </h2>
              </div>
              <div className="flex gap-2">
                {currentUser ? (
                  <>
                    {currentUser.role === "admin" ? (
                      <button
                        type="button"
                        onClick={() => router.push("/admin")}
                        className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Admin dashboard
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-full bg-white text-gray-900 px-4 py-2 text-sm font-semibold"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/signup")}
                      className="rounded-full bg-white text-gray-900 px-4 py-2 text-sm font-semibold"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </div>
            {successMessage ? (
              <p className="text-sm text-green-400">{successMessage}</p>
            ) : null}
            {!currentUser ? (
              <p className="text-sm text-amber-300">
                Sign in to add dishes to your order. Browsing is always open.
              </p>
            ) : null}
            {selectionError ? (
              <p className="text-sm text-red-300">{selectionError}</p>
            ) : null}
          </div>

          {error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveCategoryId(null)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCategoryId === null
                      ? "bg-white text-gray-900"
                      : "bg-[#3b3937] text-white border border-[#4d4a48]"
                  }`}
                >
                  All dishes
                </button>
                {categoryButtons}
              </div>

              {loading ? (
                <p className="text-gray-300">Loading menu...</p>
              ) : (
                <FoodsInfo
                  categoryId={activeCategoryId}
                  refreshKey={activeCategoryId ?? "all"}
                  selectable
                  selectedMap={selectedItems}
                  onToggleSelect={handleToggleSelect}
                  selectionDisabled={!currentUser}
                  disabledMessage="Sign in to add dishes"
                  variant="card"
                />
              )}
            </>
          )}
        </div>
      </section>

      {selectedList.length ? (
        <div className="fixed bottom-6 right-6 flex flex-wrap items-center gap-3 rounded-full bg-white/95 px-5 py-3 shadow-2xl text-gray-900">
          <div className="text-sm">
            {selectedList.length} dishes · {totalPrice.toLocaleString("mn-MN")}{" "}
            ₮
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openDrawer("cart")}
              className="rounded-full border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-800"
            >
              View cart
            </button>
            <button
              type="button"
              onClick={handleProceedToPayment}
              className="rounded-full bg-gray-900 px-3 py-1 text-sm font-semibold text-white"
            >
              Checkout
            </button>
          </div>
        </div>
      ) : currentUser ? (
        <button
          type="button"
          onClick={() => openDrawer("order")}
          className="fixed bottom-6 right-6 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-gray-900 shadow"
        >
          View past orders
        </button>
      ) : null}

      <div className="h-40 w-full bg-black text-white flex items-center justify-center">
        © {new Date().getFullYear()} NOM NOM
      </div>

      {isDrawerOpen ? (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-[#3a3836] text-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#4c4a48]">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-gray-400">
                  Order detail
                </p>
                <h3 className="text-2xl font-semibold">Your cart</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-300 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            <div className="px-6 pt-5">
              <div className="flex gap-2 rounded-full bg-[#4c4845] p-1 text-sm font-semibold">
                <button
                  type="button"
                  className={`flex-1 rounded-full py-1 ${
                    drawerTab === "cart"
                      ? "bg-white text-gray-900"
                      : "text-gray-300"
                  }`}
                  onClick={() => setDrawerTab("cart")}
                >
                  Cart
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-full py-1 ${
                    drawerTab === "order"
                      ? "bg-white text-gray-900"
                      : "text-gray-300"
                  }`}
                  onClick={() => setDrawerTab("order")}
                >
                  Order
                </button>
              </div>
            </div>

            {drawerTab === "cart" ? (
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <h4 className="text-sm uppercase tracking-widest text-gray-400">
                  My cart
                </h4>
                {selectedList.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    You haven&apos;t selected anything yet.
                  </p>
                ) : (
                  selectedList.map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-3 rounded-3xl bg-white text-gray-900 p-3"
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gray-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.foodname}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{item.foodname}</p>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItems((prev) => {
                                const next = { ...prev };
                                delete next[item._id];
                                return next;
                              })
                            }
                            className="text-sm text-red-500 hover:text-red-600"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          {(item.price || 0).toLocaleString("mn-MN")} ₮
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item._id, -1)}
                            className="h-7 w-7 rounded-full border flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item._id, 1)}
                            className="h-7 w-7 rounded-full border flex items-center justify-center"
                          >
                            +
                          </button>
                          <span className="ml-auto font-semibold">
                            {((item.price || 0) * item.quantity).toLocaleString(
                              "mn-MN"
                            )}{" "}
                            ₮
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <h4 className="text-sm uppercase tracking-widest text-gray-400">
                  Order history
                </h4>
                {orderHistoryLoading ? (
                  <p className="text-gray-400 text-sm">
                    Loading your orders...
                  </p>
                ) : orderHistoryError ? (
                  <p className="text-red-300 text-sm">{orderHistoryError}</p>
                ) : !orderHistory.length ? (
                  <p className="text-sm text-gray-400">
                    No previous orders yet.
                  </p>
                ) : (
                  orderHistory.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-3xl bg-white text-gray-900 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {order.totalPrice?.toLocaleString("mn-MN")} ₮ ( #
                            {order._id?.slice(-6)})
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.createdAt
                              ? formatOrderDate(order.createdAt)
                              : "-"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASSNAMES[order.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
                        >
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        {order.items?.map((item, idx) => (
                          <div
                            key={`${order._id}-${idx}`}
                            className="flex items-center justify-between"
                          >
                            <span>{item.food?.foodname || "Dish"}</span>
                            <span>× {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      {order.deliveryAddress ? (
                        <p className="text-xs text-gray-400">
                          {order.deliveryAddress}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            )}

            {drawerTab === "cart" ? (
              <div className="px-6 py-4 border-t border-[#4c4a48] space-y-4">
                <div className="rounded-3xl bg-white text-gray-900 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Delivery location
                  </p>
                  <textarea
                    value={addressInput}
                    onChange={(event) => setAddressInput(event.target.value)}
                    placeholder="Please share your complete address"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                    rows={2}
                  />
                </div>
                <div className="rounded-3xl bg-white text-gray-900 p-4 space-y-3">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Payment info
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Items</span>
                    <span>{totalPrice.toLocaleString("mn-MN")} ₮</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Shipping</span>
                    <span>0 ₮</span>
                  </div>
                  <div className="border-t border-dashed pt-3 flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>{totalPrice.toLocaleString("mn-MN")} ₮</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="mt-2 w-full rounded-full bg-[#f26c4f] py-2 text-sm font-semibold text-white disabled:opacity-60"
                    disabled={!selectedList.length || !currentUser}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
