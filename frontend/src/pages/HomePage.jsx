import React, { useEffect, useState } from "react";
import Hero from "../components/section/Hero";
import Footer from "../components/layout/Footer";
import MealSection from "../components/section/MealSection";
import NutritionCorner from "../components/section/NutritionCorner";
import { FinalCTA } from "../components/section/FinalCTA";
import { useAuth } from "../hooks/useAuth";
import { useUserRegion } from "../hooks/useUserRegion";
import { useMealSelection } from "../context/MealSelectionContext";
import { mockMeals } from "../data/mockMeals";
import FoodList from "../components/section/FootList";
import { mealService } from "../services/mealService";
import { useLoading } from "../context/LoadingContext";

const HomePage = () => {
  const { user } = useAuth();
  const { region, regionTitle } = useUserRegion();
  const { handleMealClick } = useMealSelection();
  const { setLoading } = useLoading();

  const [sections, setSections] = useState({
    north: [],
    dinner: [],
    family: [],
  });
  const [dietMeals, setDietMeals] = useState([]);

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

  // Load meals dựa trên region của user
  useEffect(() => {
    const loadAllSections = async () => {
      setLoading(true);

      try {
        const [regionMeals, dinner, family] = await Promise.all([
          fetchMeals(`?region=${region}`),
          fetchMeals("?meal_type=dinner"),
          fetchMeals("?suitable_for=Gia đình"),
        ]);

        const randomSlice = (arr, min, max) => {
          const count = Math.floor(Math.random() * (max - min + 1)) + min;
          return shuffle(arr).slice(0, count);
        };

        setSections({
          north: randomSlice(regionMeals, 30, 30),
          dinner: randomSlice(dinner, 30, 30),
          family: randomSlice(family, 30, 30),
        });
        // Nếu user có chế độ ăn khác "normal" thì lấy thêm section cho chế độ đó
        try {
          const diet = user?.preferences?.diet;
          const mapDietToTag = (d) => {
            if (!d) return null;
            if (d === "clean") return "eatclean";
            if (d === "vegetarian" || d === "vegan") return "vegetarian";
            return d; // e.g., keto
          };

          const dietTag = mapDietToTag(diet);
          if (user && dietTag && diet !== "normal") {
            const dietRes = await fetchMeals(`?diet_tags=${dietTag}`);
            setDietMeals(randomSlice(dietRes, 30, 30));
          } else {
            setDietMeals([]);
          }
        } catch (err) {
          console.warn("Không thể tải section chế độ ăn:", err);
          setDietMeals([]);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        setError(err.message || "Không thể tải dữ liệu từ máy chủ");
        setSections({
          north: shuffle(mockMeals).slice(0, 10),
          dinner: shuffle(mockMeals).slice(0, 10),
          family: shuffle(mockMeals).slice(0, 10),
        });
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    loadAllSections();
  }, [setLoading, region, user]);

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
          title={regionTitle}
          meals={sections.north}
          onMealClick={handleMealClick}
        />

        {/* Section: Chế độ của riêng bạn - chỉ hiển thị khi user đã lưu chế độ ăn (không phải guest và không phải 'normal') */}
        {user &&
          user.preferences &&
          user.preferences.diet &&
          user.preferences.diet !== "normal" &&
          dietMeals &&
          dietMeals.length > 0 && (
            <MealSection
              title="Chế độ của riêng bạn"
              meals={dietMeals}
              onMealClick={handleMealClick}
            />
          )}

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
      {!user && <FinalCTA />}
      <Footer />
    </div>
  );
};

export default HomePage;
