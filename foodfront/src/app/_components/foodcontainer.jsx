"use client";

import { useEffect, useState } from "react";
import UploadImage from "./imageinputer.jsx";
import { API_BASE_URL, buildAuthHeaders } from "@/lib/api";

export default function FoodContainer({
  categoryId,
  categoryName,
  onSaved,
  editingFood = null,
  onClose,
  showAddButton = true,
}) {
  const [foodname, setFoodName] = useState("");
  const [price, setPrice] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingFood) {
      setIsOpen(true);
      setFoodName(editingFood.foodname || "");
      setPrice(
        typeof editingFood.price === "number"
          ? String(editingFood.price)
          : editingFood.price || ""
      );
      setIngredients(editingFood.ingredients || "");
      setImageUrl(editingFood.image || "");
      setError("");
    } else {
      setIsOpen(false);
    }
  }, [editingFood]);

  const openModal = () => {
    setIsOpen(true);
    setFoodName("");
    setPrice("");
    setIngredients("");
    setError("");
  };

  const closeModal = () => {
    if (!saving) setIsOpen(false);
  };

  const handleSave = async () => {
    if (!foodname.trim()) {
      setError("Food name хоосон байна");
      return;
    }
    if (!categoryId) {
      setError("Category ID алга байна");
      return;
    }

    try {
      setSaving(true);

      const method = editingFood ? "PUT" : "POST";
      const url = editingFood
        ? `${API_BASE_URL}/foods/${editingFood._id}`
        : `${API_BASE_URL}/foods`;

      const res = await fetch(url, {
        method,
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          foodname,
          price: Number(price),
          ingredients,
          category: categoryId,
          image: imageUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Хадгалах үед алдаа гарлаа");
      }

      if (onSaved) onSaved();

      if (editingFood) {
        onClose?.();
      } else {
        setIsOpen(false);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* ADD BUTTON */}
      {showAddButton ? (
        <div className="w-60 h-56 border border-dashed rounded-2xl mt-5 ml-5 mb-5">
          <button
            onClick={openModal}
            className="cursor-pointer w-full h-full flex justify-center flex-col items-center gap-5"
          >
            <div className="w-10 h-10 rounded-4xl bg-red-500 text-white flex justify-center items-center">
              +
            </div>
            <p className="w-40">Add new Dish to {categoryName}</p>
          </button>
        </div>
      ) : null}

      {/* MODAL */}
      {(isOpen || editingFood) && (
        <div className="fixed inset-0 bg-black/40 rounded-2xl flex justify-center items-center z-50">
          <div className="bg-white w-[600px] p-6 rounded-xl shadow-xl relative">
            <button
              onClick={editingFood ? onClose : closeModal}
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {editingFood ? "Edit Dish" : "Add New Dish"}
            </h2>

            <div className="flex flex-col gap-3">
              <div className="flex flex-row justify-between ">
                <label className="text-sm">
                  Food Name:
                  <input
                    type="text"
                    value={foodname}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full border rounded-md px-2 py-1"
                  />
                </label>

                <label className="text-sm">
                  Price:
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border rounded-md px-2 py-1"
                  />
                </label>
              </div>

              <label className="text-sm">
                Ingredients:
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full border rounded-md px-2 py-1"
                />
              </label>

              <UploadImage onUpload={(url) => setImageUrl(url)} />

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={closeModal}
                  className="px-3 py-1 border rounded-md"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1 rounded-md bg-red-500 text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
