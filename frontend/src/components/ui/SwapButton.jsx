import React, { useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * SwapButton: Nút để swap tất cả món ăn trong một buổi ăn
 * @param {string} mealType - Loại bữa ăn (breakfast, lunch, dinner)
 * @param {function} onSwap - Callback khi click swap
 * @param {boolean} isLoading - Hiển thị loading state
 */
export default function SwapButton({ mealType, onSwap, isLoading = false }) {
  const mealTypeLabels = {
    breakfast: "Bữa sáng",
    lunch: "Bữa trưa",
    dinner: "Bữa tối",
  };

  const handleSwap = () => {
    if (!isLoading) {
      onSwap?.(mealType);
    }
  };

  return (
    <button
      onClick={handleSwap}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        isLoading
          ? "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
          : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 active:scale-95"
      }`}
      title={`Thay đổi các món ăn ${mealTypeLabels[mealType] || mealType}`}
      aria-label={`Swap ${mealType}`}
    >
      <RefreshCw
        className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      <span className="hidden sm:inline text-sm">
        Đổi {mealTypeLabels[mealType]}
      </span>
      <span className="sm:hidden text-sm">Đổi</span>
    </button>
  );
}
