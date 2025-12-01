"use client";

import Image from "next/image";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginPage from "../_components/loginform";
import { getStoredSession } from "@/lib/api";

function LoginRouteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/";

  useEffect(() => {
    const session = getStoredSession();
    if (!session?.user) return;
    if (session.user.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace(redirectTo === "/admin" ? "/" : redirectTo);
    }
  }, [router, redirectTo]);

  return (
    <main className="h-screen flex items-center justify-center bg-gradient-br from-gray-50 to-gray-100 px-4">
      <div className="flex flex-col gap-12 w-full h-full max-w-10xl mr-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
            NOM NOM · Swift Delivery
          </p>
          <h1 className="text-4xl font-semibold text-gray-900">
            Sign in to personalize your order
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl">
            Use your NOM NOM credentials to access the customer menu or admin
            dashboard.
          </p>
        </header>
        <div className="flex flex-row items-start justify-center gap-6">
          <div className="w-125">
            <LoginPage redirectTo={redirectTo} />
          </div>
          <div className="rounded-2xl">
            <Image
              src="/hero.jpg"
              alt="NOM NOM hero"
              width={900}
              height={900}
              priority
              className="object-cover rounded-4xl h-225"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginRoute() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-gray-500">
          Loading...
        </main>
      }
    >
      <LoginRouteContent />
    </Suspense>
  );
}
