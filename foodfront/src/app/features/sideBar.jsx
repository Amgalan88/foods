"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
  const pathname = usePathname();

  const isFoodActive = pathname === "/admin";
  const isOrdersActive = pathname === "/admin/orders";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("nomnom_user");
      window.localStorage.removeItem("nomnom_cart");
      window.localStorage.removeItem("nomnom_delivery_address");
    }
    window.location.href = "/login";
  };

  return (
    <div>
      <div className="w-60 h-[100vw] bg-white flex flex-col gap-4 mt-4 items-center">
        <div className="flex items-center gap-2">
          {/* next/image → width/height заавал */}
          <Image
            src="/logo.png"
            alt="NOM NOM logo"
            width={28}
            height={28}
            priority
          />
          <p>NOM NOM</p>
        </div>

        <Link href="/admin">
          <Button
            className={`w-25 h-7 border ${
              isFoodActive ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            Food menu
          </Button>
        </Link>

        <Link href="/admin/orders">
          <Button
            className={`w-25 h-7 border ${
              isOrdersActive ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            Orders
          </Button>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-full border border-black px-4 py-1 text-sm font-semibold text-black hover:bg-black hover:text-white transition"
        >
          Log out
        </button>
      </div>
    </div>
  );
};
