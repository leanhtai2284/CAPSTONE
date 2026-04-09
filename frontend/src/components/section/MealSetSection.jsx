import React from "react";
import MealCard from "../ui/MealCard";
import { useMealSelection } from "../../context/MealSelectionContext";

const mealTypeLabels = {
  breakfast: "Bữa sáng",
  lunch: "Bữa trưa",
  dinner: "Bữa tối",
  snack: "Bữa phụ / Món ăn nhẹ",
};

const MealSetSection = ({
  mealSet,
  onSwapMeal,
  isSwapping = null,
  onFindNearby,
}) => {
  const { handleMealClick } = useMealSelection();

  return (
    <div className="rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {mealTypeLabels[mealSet.mealType] || "Bữa ăn"}
        </h3>
      </div>

      <div
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {mealSet.dishes.map((meal, idx) => (
          <MealCard
            key={meal._swapId || meal._id || meal.id || `meal-${idx}`}
            meal={meal}
            onClick={() => handleMealClick(meal)}
            onSwap={onSwapMeal}
            onFindNearby={onFindNearby}
            isSwapping={isSwapping === (meal._id || meal.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MealSetSection;
