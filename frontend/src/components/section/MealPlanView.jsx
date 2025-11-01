import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WeekdaySelector from "./WeekdaySelector";
import MealSetSection from "./MealSetSection";
import { getMockMealData } from "../../data/mockMealData";

const MealPlanView = ({
  viewMode,
  selectedDay,
  onViewModeChange,
  onDayChange,
  onDishClick,
  onSwapDish,
  meals = [],
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

    // nếu backend chỉ trả 2 món vẫn hiển thị
    return arr.length ? arr : [{ mealType: "gợi ý", dishes: list }];
  };

  useEffect(() => {
    setLoading(true);

    // ✅ 1. Có data từ API → dùng luôn
    if (meals && meals.length > 0) {
      setMealSets(normalizeMealsFromApi(meals));
      setLoading(false);
      return;
    }

    // ✅ 2. KHÔNG có data từ API → bạn CHỌN: dùng mock hay không
    // 👉 Nếu bạn MUỐN test API, hãy comment 3 dòng dưới:
    const dayToUse =
      typeof selectedDay === "number" ? selectedDay : new Date().getDay();
    // const mock = getMockMealData(dayToUse);
    // setMealSets(mock);
    setMealSets([]);

    setLoading(false);
  }, [meals, selectedDay, viewMode]);

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Thực đơn của bạn</h2>
        <div className="bg-white dark:bg-slate-950 rounded-lg p-1 flex gap-1 border border-gray-400">
          <button
            onClick={() => onViewModeChange("today")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "today"
                ? "bg-primary text-white"
                : " hover:text-primary"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => onViewModeChange("weekly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "weekly"
                ? "bg-primary text-white"
                : " hover:text-primary"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Weekday Selector */}
      {viewMode === "weekly" && (
        <WeekdaySelector selectedDay={selectedDay} onDayChange={onDayChange} />
      )}

      {/* Meal Sets */}
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
                  onDishClick={onDishClick}
                  onSwapDish={onSwapDish}
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
