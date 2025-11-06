import React, { useEffect, useState } from "react";
import Hero from "../components/section/Hero";
import Footer from "../components/layout/Footer";
import MealSection from "../components/section/MealSection";
import NutritionCorner from "../components/section/NutritionCorner";
import { FinalCTA } from "../components/section/FinalCTA";
import { useAuth } from "../hooks/useAuth";
import { useMealSelection } from "../context/MealSelectionContext";
import { mockMeals } from "../data/mockMeals";
import FoodList from "../components/section/FootList";
import { mealService } from "../services/mealService";

const HomePage = () => {
  const { user } = useAuth();
  const { handleMealClick } = useMealSelection();

  const [sections, setSections] = useState({
    north: [],
    dinner: [],
    family: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: randomize array (Fisher-Yates shuffle)
  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Helper: fetch meals theo query
  const fetchMeals = async (query = "") => {
    return await mealService.getMeals(query);
  };

  // Fetch nhiều section song song
  useEffect(() => {
    const loadAllSections = async () => {
      try {
        const [north, dinner, family] = await Promise.all([
          fetchMeals("?region=Bắc"),
          fetchMeals("?meal_type=dinner"),
          fetchMeals("?suitable_for=Gia đình"),
        ]);

        const randomSlice = (arr, min, max) => {
          const count = Math.floor(Math.random() * (max - min + 1)) + min;
          return shuffle(arr).slice(0, count);
        };

        setSections({
          north: randomSlice(north, 8, 20),
          dinner: randomSlice(dinner, 6, 20),
          family: randomSlice(family, 6, 20),
        });
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        setError(err.message || "Không thể tải dữ liệu từ máy chủ");
        // ✅ Nếu muốn fallback mock data:
        setSections({
          north: shuffle(mockMeals).slice(0, 10),
          dinner: shuffle(mockMeals).slice(0, 10),
          family: shuffle(mockMeals).slice(0, 10),
        });
      } finally {
        setLoading(false);
      }
    };

    loadAllSections();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400 mb-4"></div>
        <p>Đang tải dữ liệu món ăn ngẫu nhiên...</p>
      </div>
    );
  }

  // Error fallback
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p className="mb-4">❌ Có lỗi khi tải dữ liệu: {error}</p>
        <p>Dữ liệu tạm thời hiển thị bằng mock.</p>
      </div>
    );
  }

  return (
    <div>
      <Hero onMealClick={handleMealClick} />

      <main className="min-h-screen space-y-6">
        <MealSection
          title="Hương vị miền Bắc"
          meals={sections.north}
          onMealClick={handleMealClick}
        />

        <FoodList />

        <MealSection
          title="Tối nay ăn gì?"
          meals={sections.dinner}
          onMealClick={handleMealClick}
        />

        <MealSection
          title="Phù hợp cho gia đình"
          meals={sections.family}
          onMealClick={handleMealClick}
        />
      </main>

      <NutritionCorner />
      {!user && <FinalCTA />}
      <Footer />
    </div>
  );
};

export default HomePage;
