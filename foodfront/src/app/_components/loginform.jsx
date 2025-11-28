"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL, getStoredSession } from "@/lib/api";

function LoginForm({ onSubmit }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
    } catch (err) {
      const message =
        err?.message || "Something went wrong while trying to log you in.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8">
      <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
        Welcome back
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="••••••••"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-gray-900 py-2.5 text-white font-semibold hover:bg-gray-800 transition disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage({ redirectTo = "/" }) {
  const router = useRouter();

  useEffect(() => {
    const session = getStoredSession();
    if (session?.user) {
      router.replace(session.user.role === "admin" ? "/admin" : "/");
    }
  }, [router]);

  const handleLogin = async (data) => {
    const email = data.email.trim().toLowerCase();
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: data.password,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.message || "Failed to sign in.");
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("nomnom_user", JSON.stringify(payload));
    }

    const destination =
      payload?.user?.role === "admin"
        ? "/admin"
        : redirectTo || "/";

    router.push(destination);
    return payload;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <LoginForm onSubmit={handleLogin} />

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-gray-900 hover:underline underline-offset-2"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
