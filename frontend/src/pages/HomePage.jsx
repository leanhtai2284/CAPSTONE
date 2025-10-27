import React, { useEffect, useState } from "react";
import Hero from "../components/section/Hero";
import Footer from "../components/layout/Footer";
import MealSection from "../components/section/MealSection";
import NutritionCorner from "../components/section/NutritionCorner";
import { FinalCTA } from "../components/section/FinalCTA";
import { useAuth } from "../hooks/useAuth";
import { useMealSelection } from "../hooks/useMealSelection";
import MealDetailModal from "../components/ui/MealDetailModal";
import { mockMeals } from "../data/mockMeals";

const HomePage = () => {
  const { user } = useAuth();
  const { selectedMeal, handleMealClick, closeModal } = useMealSelection();

  // 🥗 Dữ liệu món ăn (ban đầu là mock)
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    // ✅ Giả lập fetch API (có thể thay bằng thật)
    const fetchMeals = async () => {
      try {
        // 🔹 Cách 1: fetch từ API thật
        // const res = await fetch("/api/meals");
        // const data = await res.json();
        // setMeals(data);

        // 🔹 Cách 2: demo dùng mock (giữ nguyên)
        await new Promise((r) => setTimeout(r, 500)); // delay 0.5s giả lập API
        setMeals(mockMeals);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu món ăn:", error);
      }
    };

    fetchMeals();
  }, []);

  // 🧩 Cấu hình các section hiển thị
  const sections = [
    { title: "Lựa chọn của biên tập viên", count: 6 },
    { title: "Tối nay ăn gì?", count: 8 },
  ];

  return (
    <div>
      <Hero />

      <div className="min-h-screen">
        {sections.map((section, idx) => (
          <MealSection
            key={idx}
            title={section.title}
            meals={meals.slice(0, section.count)}
            onMealClick={handleMealClick}
          />
        ))}

        {selectedMeal && (
          <MealDetailModal
            meal={selectedMeal}
            onClose={closeModal}
            userPreferences={{ servings: 1, goal: "Giảm cân" }}
          />
        )}
      </div>

      <NutritionCorner />
      {!user && <FinalCTA />}
      <Footer />
    </div>
  );
};

export default HomePage;
