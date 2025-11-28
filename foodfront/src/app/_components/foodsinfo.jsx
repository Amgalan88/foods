"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

export default function FoodsInfo({
  categoryId,
  refreshKey,
  selectable = false,
  selectedMap = {},
  onToggleSelect,
  selectionDisabled = false,
  disabledMessage = "",
  variant = "default",
  showAdminActions = false,
  onEditFood,
  onDeleteFood,
}) {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const baseUrl = `${API_BASE_URL}/foods`;

        const url = categoryId
          ? `${baseUrl}/category/${categoryId}` // 👈 ЭНЭГЭЭР СОЛИНО
          : baseUrl;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Сервер алдаа: ${res.status}`);
        }

        const foodData = await res.json();
        setFoods(foodData || []);
      } catch (err) {
        console.error("Food татахад алдаа:", err);
      }
    };

    fetchAll();
  }, [categoryId, refreshKey]);
  if (!foods.length) {
    return (
      <div className="text-sm text-gray-500 px-4 py-6">
        There are no dishes in this category yet.
      </div>
    );
  }

  const renderAddButton = (food) => {
    if (!selectable) return null;
    const isSelected = !!selectedMap[food._id];
    const disabled = selectionDisabled;
    return (
      <button
        type="button"
        onClick={() => onToggleSelect?.(food)}
        disabled={disabled}
        title={disabled ? disabledMessage : undefined}
        className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold shadow ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : isSelected
              ? "bg-white text-gray-900"
              : "bg-[#f26c4f] text-white"
        }`}
      >
        {disabled ? "!" : isSelected ? "✓" : "+"}
      </button>
    );
  };

  const renderAdminActions = (food) => {
    if (!showAdminActions) return null;
    return (
      <div className="absolute left-37 top-22 flex gap-2">
        <button
          type="button"
          onClick={() => onEditFood?.(food)}
          className="h-8 w-8 rounded-full bg-white text-gray-900 shadow border border-gray-200 hover:bg-gray-100 hover:opacity-100 opacity-65"
          title="Edit dish"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={() => onDeleteFood?.(food)}
          className="h-8 w-8 rounded-full bg-white text-gray-900 shadow border border-gray-200 hover:bg-gray-100 hover:opacity-100 opacity-65"
          title="Remove dish"
        >
          ✕
        </button>
      </div>
    );
  };

  if (variant === "card") {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {foods.map((food, index) => (
          <div
            key={`${food._id}-${index}`}
            className="relative rounded-[28px] bg-[#3a3836] p-4 text-white shadow-lg border border-[#4b4947]"
          >
            {renderAdminActions(food)}
            {food.image ? (
              <div className="h-48 w-full overflow-hidden rounded-2xl">
                <img
                  src={food.image}
                  alt={food.foodname}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-48 w-full rounded-2xl bg-[#4f4c4b] flex items-center justify-center text-sm text-gray-300">
                No image
              </div>
            )}
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-lg font-semibold truncate">{food.foodname}</p>
              <p className="text-lg font-semibold text-[#f7c38a]">
                {food.price != null
                  ? `${food.price.toLocaleString("mn-MN")} ₮`
                  : "-"}
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-200 line-clamp-2">
              {food.ingredients || "Freshly prepared from our kitchen."}
            </p>
            {renderAddButton(food)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-4 mt-5 ml-5 mb-5 ">
      {foods.map((food, index) => (
        <div
          key={`${food._id}-${index}`}
          className="w-60 border rounded-2xl flex flex-col items-center py-3 bg-white shadow-sm"
        >
          <div className="relative w-full">{renderAdminActions(food)}</div>
          <div className="w-[90%] bg-amber-200 h-[120px] rounded-2xl mt-1 overflow-hidden flex items-center justify-center">
            {food.image ? (
              <img
                src={food.image}
                alt={food.foodname}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-xs text-gray-600">No image</span>
            )}
          </div>

          <div className="flex flex-row justify-between w-[90%] mt-4 text-sm">
            <p className="font-medium truncate max-w-[60%]">{food.foodname}</p>
            <p className="font-semibold">
              {food.price != null
                ? `${food.price.toLocaleString("mn-MN")} ₮`
                : "-"}
            </p>
          </div>
          <div className="w-[90%] text-[12px] mt-3 mb-2 text-gray-700">
            {food.ingredients || "No ingredients"}
          </div>
          {selectable ? (
            <button
              type="button"
              onClick={() => onToggleSelect?.(food)}
              disabled={selectionDisabled}
              className={`w-[90%] mb-2 text-sm border rounded-lg py-1 transition opacity-50 ${
                selectionDisabled
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-90"
                  : selectedMap[food._id]
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-900"
              }`}
              title={selectionDisabled ? disabledMessage : undefined}
            >
              {selectionDisabled
                ? disabledMessage || "Sign in to order"
                : selectedMap[food._id]
                  ? "Remove from order"
                  : "Add to order"}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
