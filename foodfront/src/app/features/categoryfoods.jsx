"use client";

import { useState } from "react";
import FoodContainer from "../_components/foodcontainer.jsx";
import FoodsInfo from "../_components/foodsinfo.jsx";
import { API_BASE_URL, buildAuthHeaders } from "@/lib/api";

export default function Categoryfoods({ categoryId, categoryName }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingFood, setEditingFood] = useState(null);
  const [actionError, setActionError] = useState("");

  const handleSaved = () => setRefreshKey((p) => p + 1);

  const handleEditFood = (food) => {
    setActionError("");
    setEditingFood(food);
  };

  const handleDeleteFood = async (food) => {
    if (!food?._id) return;
    const confirmDelete =
      typeof window === "undefined"
        ? true
        : window.confirm(`Delete "${food.foodname}"?`);
    if (!confirmDelete) return;

    try {
      setActionError("");
      const res = await fetch(`${API_BASE_URL}/foods/${food._id}`, {
        method: "DELETE",
        headers: buildAuthHeaders(),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "Failed to delete dish.");
      }
      handleSaved();
    } catch (err) {
      setActionError(err.message || "Failed to delete dish.");
    }
  };

  const handleCloseEdit = () => {
    setEditingFood(null);
  };

  return (
    <div className="w-[95%] bg-white flex flex-col mt-2 rounded-2xl items-start justify-start mb-4 overflow-x-auto">
      <div className="ml-5 mt-2">
        Category name:
        <span className="ml-2 font-semibold">{categoryName}</span>
      </div>

      <div className="flex w-full">
        <FoodContainer
          categoryId={categoryId}
          categoryName={categoryName}
          onSaved={handleSaved}
        />
        {editingFood ? (
          <FoodContainer
            categoryId={categoryId}
            categoryName={categoryName}
            onSaved={() => {
              handleSaved();
              handleCloseEdit();
            }}
            editingFood={editingFood}
            onClose={handleCloseEdit}
            showAddButton={false}
          />
        ) : null}
        <div className="flex-1">
          {actionError ? (
            <p className="text-sm text-red-600 ml-5 mt-3">{actionError}</p>
          ) : null}
          <FoodsInfo
            categoryId={categoryId}
            refreshKey={refreshKey}
            showAdminActions
            onEditFood={handleEditFood}
            onDeleteFood={handleDeleteFood}
          />
        </div>
      </div>
    </div>
  );
}
