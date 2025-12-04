import React from "react";
import {
  StarIcon,
  ClockIcon,
  Heart,
  ChefHat,
  MapPinIcon,
  RefreshCw,
} from "lucide-react";
import { FaMoneyBillWave } from "react-icons/fa";
import SaveButton from "./SaveButton";

export default function MealCard({
  meal,
  onClick,
  onToggleSave,
  onSwap,
  isSwapping = false,
}) {
  if (!meal) return null;

  const imageUrl = meal.image_url || meal.image || "/fallback.jpg";
  const dishName = meal.name_vi || meal.title || "Món ăn không tên";

  const handleSwapClick = (e) => {
    e.stopPropagation();
    if (!isSwapping && onSwap) {
      onSwap(meal._id || meal.id);
    }
  };

  return (
    <div
      className="flex-shrink-0 rounded-2xl dark:bg-black dark:border-slate-900 
      bg-white/70 overflow-hidden border border-gray-200 
      hover:border-gray-200 hover:shadow-lg hover:shadow-gray-300
      dark:hover:shadow-green-800 dark:hover:border-green-500/50
      transition-all duration-300 cursor-pointer group"
      onClick={() => onClick?.(meal)}
    >
      {/* Ảnh */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={dishName}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {meal.diet_tags?.[0] && (
          <div className="absolute top-0 left-0 p-3">
            <span
              className="inline-flex items-center gap-1 px-3 py-1 
                bg-gradient-to-r from-green-400 to-lime-300 
                dark:from-green-400 dark:to-lime-300
                border border-green-400/40 text-green-900 font-bold
                rounded-full text-xs tracking-wide shadow-sm"
            >
              <ChefHat className="w-3 h-3 " />
              {meal.diet_tags[0]}
            </span>
          </div>
        )}

        <SaveButton meal={meal} onToggleSave={onToggleSave} />
      </div>

      <div className="p-4 space-y-3 relative">
        {/* Tên món */}
        <h3 className="font-bold text-xl drop-shadow-sm line-clamp-1">
          {meal.name_vi}
        </h3>

        {/* Rating + Likes */}
        {/* <div className="flex items-center gap-3 text-sm ">
          {meal.rating && (
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">{meal.rating}</span>
            </div>
          )}
          {meal.likes_count !== undefined && (
            <div className="flex items-center gap-1 ">
              <Heart className="w-4 h-4 text-rose-400 fill-current" />
              <span>{meal.likes_count.toLocaleString()}</span>
            </div>
          )}
        </div> */}

        <div className="grid grid-cols-2 w-full gap-2">
          {meal.cook_time_min && (
            <span
              className="inline-flex items-center justify-center gap-1 px-3 py-2 
              bg-gradient-to-r from-blue-200/80 to-cyan-100/70 
              dark:from-blue-300 dark:to-cyan-200
              border border-blue-400 text-blue-800 font-bold
              rounded-md text-xs tracking-wide shadow-sm"
            >
              <ClockIcon className="w-3 h-3" />
              {meal.cook_time_min} phút
            </span>
          )}

          {meal.price_estimate?.min && (
            <span
              className="inline-flex items-center justify-center gap-1 px-3 py-2 
                bg-gradient-to-r from-green-400/40 to-lime-300/30
                dark:from-green-400/50 dark:to-lime-300/40
                border border-green-500 text-green-600 dark:text-lime-300
                rounded-md text-xs font-bold tracking-wide shadow-sm"
            >
              <FaMoneyBillWave className="w-3 h-3 " />
              {(meal.price_estimate.min / 1000).toFixed(0)}.000 VNĐ{" "}
            </span>
          )}
        </div>

        {/* Swap button - bottom right corner */}
        {onSwap && (
          <button
            onClick={handleSwapClick}
            disabled={isSwapping}
            className={`absolute bottom-0 right-0 flex items-center justify-center gap-1 px-3 py-2 rounded-tl-xl font-semibold transition-all ${
              isSwapping
                ? "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 " +
                  "dark:from-blue-600 dark:to-cyan-600 dark:hover:from-blue-700 dark:hover:to-cyan-700 " +
                  "hover:shadow-lg hover:shadow-blue-400/50 active:scale-95"
            }`}
            title={`Đổi: ${dishName}`}
          >
            <RefreshCw
              size={16}
              className={`${isSwapping ? "animate-spin" : ""}`}
            />
            <span className="text-xs whitespace-nowrap">
              {isSwapping ? "..." : "Đổi"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
