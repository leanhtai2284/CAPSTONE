import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark } from "lucide-react";
import WeekdaySelector from "./WeekdaySelector";
import MealSetSection from "./MealSetSection";

const MealPlanView = ({
  viewMode,
  selectedDay,
  onViewModeChange,
  onDayChange,
  meals = [],
  onSwapMeal,
  isSwapping = false,
  onSaveDailyMenu,
}) => {
  const [mealSets, setMealSets] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeMealsFromApi = (list) => {
    const breakfast = list.filter((m) =>
      (m.meal_types || []).includes("breakfast")
    );
    const lunch = list.filter((m) => (m.meal_types || []).includes("lunch"));
    const dinner = list.filter((m) => (m.meal_types || []).includes("dinner"));
    const arr = [];
    if (breakfast.length)
      arr.push({ mealType: "breakfast", dishes: breakfast });
    if (lunch.length) arr.push({ mealType: "lunch", dishes: lunch });
    if (dinner.length) arr.push({ mealType: "dinner", dishes: dinner });
    return arr.length ? arr : [{ mealType: "gợi ý", dishes: list }];
  };

  useEffect(() => {
    setLoading(true);
    if (meals && meals.length > 0) {
      setMealSets(normalizeMealsFromApi(meals));
    } else {
      setMealSets([]);
    }
    setLoading(false);
  }, [meals, selectedDay, viewMode]);

  const handleSaveDailyMenu = () => {
    if (onSaveDailyMenu) {
      onSaveDailyMenu(meals, selectedDay);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Thực đơn của bạn</h2>
        <div className="flex items-center gap-3">
          {viewMode === "today" && meals.length > 0 && (
            <button
              onClick={handleSaveDailyMenu}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-secondary transition-colors text-sm font-medium"
            >
              <Bookmark className="w-4 h-4" />
              Lưu thực đơn
            </button>
          )}
          <div className="bg-white dark:bg-slate-950 rounded-lg p-1 flex gap-1 border border-gray-400">
            <button
              onClick={() => onViewModeChange("today")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "today"
                  ? "bg-primary text-white"
                  : "hover:text-primary"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onViewModeChange("weekly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "weekly"
                  ? "bg-primary text-white"
                  : "hover:text-primary"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {viewMode === "weekly" && (
        <WeekdaySelector selectedDay={selectedDay} onDayChange={onDayChange} />
      )}

      {loading ? (
        <p className="text-sm">Loading meals...</p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${selectedDay}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {mealSets.map((mealSet, index) => (
              <motion.div
                key={`${mealSet.mealType}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MealSetSection
                  mealSet={mealSet}
                  onSwapMeal={onSwapMeal}
                  isSwapping={isSwapping}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default MealPlanView;
