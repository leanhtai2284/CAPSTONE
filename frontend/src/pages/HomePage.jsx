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
import { useLoading } from "../context/LoadingContext";

const HomePage = () => {
  const { user } = useAuth();
  const { handleMealClick } = useMealSelection();
  const { setLoading } = useLoading();

  const [sections, setSections] = useState({
    north: [],
    dinner: [],
    family: [],
  });

  const [error, setError] = useState(null);

  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const fetchMeals = async (query = "") => {
    return await mealService.getMeals(query);
  };

  useEffect(() => {
    const loadAllSections = async () => {
      // 🌀 Hiện loading 2 giây
      setLoading(true);

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
        setSections({
          north: shuffle(mockMeals).slice(0, 10),
          dinner: shuffle(mockMeals).slice(0, 10),
          family: shuffle(mockMeals).slice(0, 10),
        });
      } finally {
        // ⏳ Giữ loading ít nhất 2 giây rồi mới tắt
        setTimeout(() => setLoading(false), 1000);
      }
    };

    loadAllSections();
  }, [setLoading]);

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
