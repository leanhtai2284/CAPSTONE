import React, { useEffect, useState } from "react";
import Hero from "../components/section/Hero";
import Footer from "../components/layout/Footer";
import MealSection from "../components/section/MealSection";
import NutritionCorner from "../components/section/NutritionCorner";
import { FinalCTA } from "../components/section/FinalCTA";
import { useAuth } from "../hooks/useAuth";
import { useMealSelection } from "../context/MealSelectionContext"; // ⚡ lấy từ context, không từ hooks
import { mockMeals } from "../data/mockMeals";
import FoodList from "../components/section/FootList";

const HomePage = () => {
  const { user } = useAuth();
  const { handleMealClick } = useMealSelection(); // chỉ cần hàm này
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/recipes", {
          cache: "no-store",
        });
        const data = await res.json();
        console.log("📦 API trả về:", data);

        let mealList = [];

        if (Array.isArray(data)) {
          mealList = data;
        } else if (Array.isArray(data.items)) {
          mealList = data.items;
        } else if (Array.isArray(data.data)) {
          mealList = data.data;
        } else if (Array.isArray(data.recipes)) {
          mealList = data.recipes;
        } else {
          console.warn(
            "⚠️ API không trả về mảng hợp lệ, dùng mockMeals thay thế"
          );
          mealList = mockMeals;
        }
        setMeals(mealList);
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu món ăn:", error);
        setMeals(mockMeals);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Đang tải dữ liệu món ăn...
      </div>
    );
  }

  return (
    <div>
      <Hero onMealClick={handleMealClick} />

      <div className="min-h-screen space-y-4">
        <MealSection
          title="Hương vị miền Bắc"
          meals={meals
            .filter((m) => m.region === "Bắc")
            .sort(() => 0.5 - Math.random())
            .slice(0, 15)} // luôn lấy 6 món ngẫu nhiên
          onMealClick={handleMealClick}
        />
        <FoodList />
        <MealSection
          title="Tối nay ăn gì?"
          meals={meals
            .filter((m) => m.meal_types?.includes("dinner"))
            .sort(() => 0.5 - Math.random())
            .slice(0, 10)}
          onMealClick={handleMealClick}
        />

        <MealSection
          title="Phù hợp cho gia đình"
          meals={meals
            .filter(
              (m) =>
                Array.isArray(m.suitable_for) &&
                m.suitable_for.includes("Gia đình")
            )
            .sort(() => 0.5 - Math.random())
            .slice(0, 10)}
          onMealClick={handleMealClick}
        />
      </div>

      <NutritionCorner />
      {!user && <FinalCTA />}
      <Footer />
    </div>
  );
};

export default HomePage;
