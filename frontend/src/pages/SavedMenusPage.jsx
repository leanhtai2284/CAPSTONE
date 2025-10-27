import React, { useEffect, useState } from "react";
import MealCard from "../components/ui/MealCard";

const SavedMenusPage = () => {
  const [savedMeals, setSavedMeals] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("savedMeals")) || [];
    setSavedMeals(data);
  }, []);

  return (
    <div className="min-h-screen px-4 md:px-10 py-10 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        {savedMeals.length > 0 && (
          <div className="w-24 h-1 bg-green-500 rounded-full mt-3" />
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
            <MealCard key={meal.uniqueKey} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedMenusPage;
