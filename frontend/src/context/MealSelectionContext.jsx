import React, { createContext, useContext, useState, useRef } from "react";
import MealDetailModal from "../components/ui/MealDetailModal";

const MealSelectionContext = createContext();

export const MealSelectionProvider = ({ children }) => {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const cacheRef = useRef({});

  const handleMealClick = (meal) => {
    console.log("👀 Xem chi tiết món:", meal.name_vi || meal.dish_name);
    setSelectedMeal(meal);
  };

  const closeModal = () => setSelectedMeal(null);

  return (
    <MealSelectionContext.Provider
      value={{
        selectedMeal,
        handleMealClick,
        closeModal,
        cacheRef,
      }}
    >
      {children}

      {/* ⚡ Modal được render toàn cục ở đây — không nháy nữa */}
      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          onClose={closeModal}
          userPreferences={{ servings: 1, goal: "Giảm cân" }}
        />
      )}
    </MealSelectionContext.Provider>
  );
};

export const useMealSelection = () => useContext(MealSelectionContext);
