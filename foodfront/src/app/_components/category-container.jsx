"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { API_BASE_URL, buildAuthHeaders } from "@/lib/api";

export default function CategoryContainer() {
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);

  // 🔹 Modal-н төлөв
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [catRes, foodRes] = await Promise.all([
          fetch(`${API_BASE_URL}/category`),
          fetch(`${API_BASE_URL}/foods`),
        ]);

        const [catData, foodData] = await Promise.all([
          catRes.json(),
          foodRes.json(),
        ]);

        setCategories(catData || []);
        setFoods(foodData || []);
      } catch (err) {
        console.error("Category/Food татахад алдаа:", err);
      }
    };

    fetchAll();
  }, []);

  // 👉 Category бүрийн хоолыг тоолох функц
  const getCountForCategory = (catId) => {
    return foods.filter((food) => {
      if (!food.category) return false;

      // populate хийгдсэн → object хэлбэртэй
      if (typeof food.category === "object") {
        return food.category._id === catId;
      }

      return false;
    }).length;
  };

  // 🔹 Modal нээх/хаах
  const openModal = () => {
    setNewCategoryName("");
    setError("");
    setIsOpen(true);
  };

  const closeModal = () => {
    if (saving) return; // хадгалж байхад хаахгүй
    setIsOpen(false);
  };

  // 🔹 Save дархад backend рүү category үүсгэх
  const handleSave = async () => {
    if (!newCategoryName.trim()) {
      setError("Category name хоосон байж болохгүй");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/category`, {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ category: newCategoryName }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Хадгалах үед алдаа гарлаа");
      }

      const newCat = await res.json();

      // State дээрээ шинэ category-г нэмнэ
      setCategories((prev) => [...prev, newCat]);
      setIsOpen(false);
      setNewCategoryName("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* CATEGORY BUTTON-УУД + ADD BUTTON */}
      <div className="w-fit flex mt-2 ml-5 mb-2 gap-4 flex-wrap  ">
        {categories.map((cat) => {
          const count = getCountForCategory(cat._id);

          return (
            <Button
              key={cat._id}
              className="w-40 bg-white border text-black flex flex-row justify-center rounded-2xl items-center gap-4"
            >
              {/* Категорийн нэр */}
              <p>{cat.category}</p>

              {/* Хоолны тоо */}
              <div className="bg-black px-2 h-6 rounded-4xl text-white flex justify-center items-center text-xs">
                {count}
              </div>
            </Button>
          );
        })}

        {/* 🔴 Сүүлчийн + товч → modal нээдэг */}
        <button type="button" onClick={openModal} className="cursor-pointer ">
          <div className="w-7 h-7 rounded-4xl bg-red-500 text-white flex justify-center items-center">
            +
          </div>
        </button>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl p-5 w-[320px] relative shadow-lg">
            {/* X товч */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">Add new category</h2>

            <label className="flex flex-col gap-1 mb-4 text-sm">
              <span>Category name:</span>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="e.g. Appetizers"
              />
            </label>

            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-3 py-1 text-sm border rounded-md"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1 text-sm rounded-md bg-amber-500 text-white disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
