import React, { useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import MealCard from "../ui/MealCard";

/**
 * MealSection: responsive như code cũ (1 -> 2 -> 4)
 */
export default function MealSection({ title, meals = [], onMealClick }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    // Cuộn 80% chiều rộng container (mượt và phù hợp với nhiều kích thước)
    const amount = Math.round(container.offsetWidth * 0.8);
    container.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="container mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 transition"
            aria-label="scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 transition"
            aria-label="scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-8 pb-4 scroll-smooth scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {meals.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 italic">
            Không có món ăn để hiển thị.
          </div>
        ) : (
          meals.map((meal) => (
            <div
              key={meal.id ?? meal._id}
              className="flex-shrink-0 w-full sm:w-[48%] lg:w-[23%] snap-start"
            >
              <MealCard meal={meal} onClick={() => onMealClick?.(meal)} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
