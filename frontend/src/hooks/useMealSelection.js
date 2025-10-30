import { useState } from "react";

/**
 * Hook quản lý logic chọn món và đóng/mở modal.
 * Dễ tái sử dụng ở nhiều trang khác (Home, MealPlan, ...).
 */
export const useMealSelection = () => {
  const [selectedMeal, setSelectedMeal] = useState(null);

  const handleMealClick = (meal) => {
    console.log("Xem chi tiết món:", meal.name_vi);
    setSelectedMeal(meal);
  };

  const closeModal = () => setSelectedMeal(null);

  return {
    selectedMeal,
    handleMealClick,
    closeModal,
  };
};
