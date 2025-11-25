import React, { useEffect, useState } from "react";
import MealCard from "../components/ui/MealCard";
import { useMealSelection } from "../context/MealSelectionContext";
import { favoriteService } from "../services/favoriteService";

const SavedMenusPage = () => {
  const [savedMeals, setSavedMeals] = useState([]);
  const { handleMealClick } = useMealSelection(); // ✅ dùng context để mở modal

  const loadSavedMeals = async () => {
    try {
      const meals = await favoriteService.getAll(); // đã trả về mảng meal
      setSavedMeals(meals);
    } catch (err) {
      console.error("Error loading saved meals:", err);
    }
  };

  useEffect(() => {
    loadSavedMeals();
  }, []);

  // Callback khi toggle save - cập nhật danh sách ngay lập tức
  const handleToggleSave = (meal, isNowSaved) => {
    if (!isNowSaved) {
      // Nếu đã hủy lưu, xóa món ăn khỏi danh sách
      setSavedMeals((prev) =>
        prev.filter(
          (m) => m.id !== meal.id && m.uniqueKey !== (meal.uniqueKey || meal.id)
        )
      );
    } else {
      // Nếu đã lưu, reload lại danh sách
      loadSavedMeals();
    }
  };

  return (
    <div className="min-h-screen container px-4 md:px-10 py-10 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Món ăn đã lưu
        </h1>
        {savedMeals.length > 0 && (
          <div className="w-24 h-1 bg-primary rounded-full mt-3" />
        )}
      </div>

      {/* Nội dung */}
      {savedMeals.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Bạn chưa lưu món ăn nào cả 😢
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Hãy khám phá và lưu lại những món yêu thích nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {savedMeals.map((meal) => (
            <MealCard
              key={meal.uniqueKey || meal.id}
              meal={meal}
              onClick={() => handleMealClick(meal)} // ✅ mở modal khi click
              onToggleSave={handleToggleSave} // ✅ callback khi toggle save
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedMenusPage;
