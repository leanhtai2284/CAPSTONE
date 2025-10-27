import React from "react";
import { StarIcon, ClockIcon, HandCoins, Heart, Landmark } from "lucide-react";
import SaveButton from "./SaveButton";

export default function MealCard({ meal, onClick }) {
  if (!meal) return null;

  const imageUrl = meal.image_url || meal.image || "/fallback.jpg";
  const dishName = meal.dish_name || meal.title || "Món ăn không tên";

  return (
    <div
      className="flex-shrink-0 rounded-2xl dark:bg-slate-950 dark:border-slate-600 
      bg-white/70 overflow-hidden border border-gray-200 
      hover:border-primary hover:shadow-xl hover:shadow-[#22C55E]/60
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
        <SaveButton meal={meal} />
      </div>

      {/* Nội dung */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-1">{dishName}</h3>

        <div className="flex items-center gap-4 text-sm">
          {meal.rating && (
            <div className="flex items-center gap-1 text-yellow-400">
              <StarIcon className="w-4 h-4 fill-current" />
              <span className="font-medium">{meal.rating}</span>
            </div>
          )}
          {meal.likes_count !== undefined && (
            <div className="flex items-center gap-1 text-red-400">
              <Heart className="w-4 h-4 fill-current" />
              <span>{meal.likes_count}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {meal.cooking_time && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-xs">
              <ClockIcon className="w-3 h-3 text-[#22C55E]" />
              {meal.cooking_time} phút
            </span>
          )}
          {meal.cost_estimate && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-xs">
              <Landmark className="w-3 h-3 text-[#22C55E]" />
              {(meal.cost_estimate / 1000).toFixed(0)}k
            </span>
          )}
          {meal.diet_category && (
            <span className="px-3 py-1 bg-[#22C55E]/20 text-[#22C55E] rounded-full text-xs font-medium">
              {meal.diet_category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
