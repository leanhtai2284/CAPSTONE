import React from "react";
import { StarIcon, ClockIcon, Heart } from "lucide-react";
import { FaMoneyBillWave } from "react-icons/fa";
import SaveButton from "./SaveButton";

export default function MealCard({ meal, onClick, onToggleSave }) {
  if (!meal) return null;

  const imageUrl = meal.image_url || meal.image || "/fallback.jpg";
  const dishName = meal.name_vi || meal.title || "Món ăn không tên";

  return (
    <div
      className="flex-shrink-0 rounded-2xl dark:bg-slate-950 dark:border-slate-800 
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
              {meal.diet_tags[0]}
            </span>
          </div>
        )}

        <SaveButton meal={meal} onToggleSave={onToggleSave} />
      </div>

      <div className="p-4 space-y-3">
        {/* Tên món */}
        <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 line-clamp-1 ">
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

        <div className="flex items-center gap-2 flex-wrap">
          {/* ⏱ Thời gian nấu */}
          {meal.cook_time_min && (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 
                bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 
                dark:from-emerald-400/20 dark:to-emerald-300/10
                border border-emerald-400/40 text-emerald-700 dark:text-emerald-300
                rounded-full text-xs font-medium shadow-sm"
            >
              <ClockIcon className="w-3 h-3 text-emerald-500 dark:text-emerald-300" />
              {meal.cook_time_min} phút
            </span>
          )}

          {/* 💰 Giá ước lượng */}
          {meal.price_estimate?.min && (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 
                bg-gradient-to-r from-amber-400/20 to-yellow-300/10 
                dark:from-amber-300/20 dark:to-yellow-200/10
                border border-amber-400/40 text-amber-600 dark:text-amber-300
                rounded-full text-xs font-medium shadow-sm"
            >
              <FaMoneyBillWave className="w-3 h-3 text-amber-500 dark:text-amber-300" />
              {(meal.price_estimate.min / 1000).toFixed(0)}.000 VNĐ{" "}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
