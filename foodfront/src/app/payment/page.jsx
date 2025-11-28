"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, getStoredSession, buildAuthHeaders } from "@/lib/api";

export default function PaymentPage() {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedCart = window.localStorage.getItem("nomnom_cart");
    const savedAddress = window.localStorage.getItem("nomnom_delivery_address");
    const session = getStoredSession();

    if (!storedCart) {
      router.replace("/menu");
      return;
    }

    try {
      const parsedCart = JSON.parse(storedCart);
      setCartItems(
        Array.isArray(parsedCart)
          ? parsedCart.map((item) => ({
              ...item,
              quantity: item.quantity || 1,
            }))
          : []
      );
    } catch (err) {
      console.error("Failed to parse cart", err);
      setCartItems([]);
    }

    setUser(session?.user || null);
    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, [router]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
      0
    );
  }, [cartItems]);

  const handleQuantityChange = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id !== id) return item;
        const nextQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: nextQty };
      })
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!cartItems.length) {
      window.localStorage.removeItem("nomnom_cart");
    } else {
      window.localStorage.setItem("nomnom_cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const handleSubmit = async () => {
    setError("");

    if (!cartItems.length) {
      setError("Please add dishes from the menu before paying.");
      return;
    }
    if (!address.trim()) {
      setError("Delivery address is required.");
      return;
    }
    if (!user?._id) {
      setError("Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          deliveryAddress: address.trim(),
          status: "pending",
          items: cartItems.map((item) => ({
            food: item._id,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Payment failed.");
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("nomnom_cart");
        window.localStorage.setItem("nomnom_delivery_address", address.trim());
      }

      router.replace("/menu?order=success");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">
          Confirm your order
        </h1>

        {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Items</h2>
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-600">
                Your cart is empty.{" "}
                <button
                  type="button"
                  className="text-gray-900 underline"
                  onClick={() => router.push("/menu")}
                >
                  Back to menu
                </button>
              </p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="border rounded-xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.foodname}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(item.price || 0).toLocaleString("mn-MN")} ₮
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item._id, -1)}
                          className="w-7 h-7 rounded-full border flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item._id, 1)}
                          className="w-7 h-7 rounded-full border flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-sm text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-2xl p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Delivery details
            </h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Apartment, street, city"
              className="w-full border rounded-xl px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900"
              rows={4}
            />

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-lg font-semibold mb-4">
                <span>Total to pay</span>
                <span>{totalPrice.toLocaleString("mn-MN")} ₮</span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!cartItems.length || isSubmitting}
                className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-60"
              >
                {isSubmitting ? "Processing..." : "Pay now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
