import React, { createContext, useContext, useState } from "react";
import MealDetailModal from "../components/ui/MealDetailModal";

/**
 * 🧩 MealSelectionContext
 * Dùng để quản lý trạng thái chọn món ăn & hiển thị modal chi tiết
 * => Toàn bộ app có thể mở/đóng modal mà không cần props truyền tầng tầng lớp lớp.
 */

const MealSelectionContext = createContext();

/**
 * ✅ Provider bao quanh toàn bộ app
 * Đặt ở App.jsx (bọc quanh <Router> hoặc <HomePage />)
 */
export const MealSelectionProvider = ({ children }) => {
  const [selectedMeal, setSelectedMeal] = useState(null);

  const handleMealClick = (meal) => {
    console.log("📖 Xem chi tiết món:", meal.name_vi || meal.title);
    setSelectedMeal(meal);
  };

  const closeModal = () => setSelectedMeal(null);

  return (
    <MealSelectionContext.Provider
      value={{
        selectedMeal,
        handleMealClick,
        closeModal,
      }}
    >
      {children}

      {/* ⚡ Modal toàn cục, luôn hiển thị khi selectedMeal có giá trị */}
      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          onClose={closeModal}
          userPreferences={{ servings: 1, goal: "Cân bằng" }}
        />
      )}
    </MealSelectionContext.Provider>
  );
};

/**
 * ✅ Hook tiện lợi để truy cập context
 * => Ở mọi component: const { handleMealClick } = useMealSelection();
 */
export const useMealSelection = () => useContext(MealSelectionContext);
