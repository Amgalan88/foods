"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/app/features/sideBar";
import CategoryContainer from "../_components/category-container";
import Categoryfoods from "../features/categoryfoods";
import { API_BASE_URL, getStoredSession, buildAuthHeaders } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const session = getStoredSession();
    if (!session?.user) {
      router.replace("/login?redirect=/admin");
      return;
    }
    if (session.user.role !== "admin") {
      router.replace("/");
      return;
    }

    async function loadCats() {
      try {
        const res = await fetch(`${API_BASE_URL}/category`, {
          headers: buildAuthHeaders(),
        });
        const data = await res.json();
        setCategories(data || []);
      } catch (e) {
        console.error("Category татахад алдаа:", e);
      }
    }

    loadCats();
  }, [router]);

  return (
    <div className="flex flex-col justify-center">
      <div className="flex">
        <Sidebar />

        <div className="w-full h-auto bg-gray-200 flex justify-start items-center flex-col flex-wrap">
          <div className="w-[95%] bg-white flex flex-row flex-wrap mt-10 rounded-2xl items-center justify-start mb-4">
            <CategoryContainer />
          </div>

          {categories.map((cat) => (
            <Categoryfoods
              key={cat._id}
              categoryId={cat._id}
              categoryName={cat.category}
            />
          ))}
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}
