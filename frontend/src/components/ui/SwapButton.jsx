import React from "react";
import { RefreshCw } from "lucide-react";

/**
 * SwapButton: Nút để swap một món ăn cụ thể
 * @param {string} mealId - ID của món ăn
 * @param {string} mealName - Tên món ăn (để hiển thị tooltip)
 * @param {function} onSwap - Callback khi click swap
 * @param {boolean} isLoading - Hiển thị loading state
 */
export default function SwapButton({
  mealId,
  mealName,
  onSwap,
  isLoading = false,
}) {
  const handleSwap = (e) => {
    e.stopPropagation(); // Prevent triggering meal click
    if (!isLoading && onSwap) {
      onSwap(mealId);
    }
  };

  return (
    <button
      onClick={handleSwap}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg 
        font-semibold transition-all duration-200 ${
          isLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 scale-95"
            : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 " +
              "dark:from-blue-600 dark:to-cyan-600 dark:hover:from-blue-700 dark:hover:to-cyan-700 " +
              "hover:shadow-lg hover:shadow-blue-400/50 dark:hover:shadow-blue-600/30 " +
              "active:scale-95 hover:scale-105"
        }`}
      title={`Đổi: ${mealName}`}
      aria-label={`Swap meal ${mealId}`}
    >
      <RefreshCw
        size={16}
        className={`flex-shrink-0 ${isLoading ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      <span className="text-xs sm:text-sm whitespace-nowrap">
        {isLoading ? "Đang xử lý..." : "Đổi"}
      </span>
    </button>
  );
}
