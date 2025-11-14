import React from "react";
import MealCard from "../ui/MealCard";
import SwapButton from "../ui/SwapButton";
import { useMealSelection } from "../../context/MealSelectionContext";

const mealTypeLabels = {
  breakfast: "Bữa sáng",
  lunch: "Bữa trưa",
  dinner: "Bữa tối",
  snack: "Bữa phụ / Món ăn nhẹ",
};

const MealSetSection = ({ mealSet, onSwapMeal, isSwapping = false }) => {
  const { handleMealClick } = useMealSelection();

  return (
    <div className="rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {mealTypeLabels[mealSet.mealType] || "Bữa ăn"}
        </h3>
        {["breakfast", "lunch", "dinner"].includes(mealSet.mealType) && (
          <SwapButton
            mealType={mealSet.mealType}
            onSwap={onSwapMeal}
            isLoading={isSwapping}
          />
        )}
      </div>

      <div
        className={`grid gap-4 ${
          mealSet.mealType === "breakfast"
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {mealSet.dishes.map((meal) => (
          <MealCard
            key={meal._id || meal.id}
            meal={meal}
            onClick={() => handleMealClick(meal)}
            onSwap={() => onSwapMeal?.(meal._id || meal.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MealSetSection;
