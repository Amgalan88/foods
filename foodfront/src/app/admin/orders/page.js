"use client";

import { Sidebar } from "@/app/features/sideBar";
import Orderbar from "@/app/features/orderSection";
import { useEffect } from "react";
import { getStoredSession } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = getStoredSession();
    if (!session?.user) {
      router.replace("/login?redirect=/admin/orders");
      return;
    }
    if (session.user.role !== "admin") {
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="flex">
      <Sidebar />
      <Orderbar />
    </div>
  );
}
