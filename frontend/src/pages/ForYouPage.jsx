import React, { useState } from "react";
import { motion } from "framer-motion";
import UserInputForm from "../components/section/UserInputForm";
import MealPlanView from "../components/section/MealPlanView";
import NutritionSummary from "../components/section/NutritionSummary";
import SafetyNotice from "../components/section/SafetyNotice";
// Modal is provided globally by MealSelectionProvider; do not render here to avoid duplicates
import { suggestMenuApi, swapMealTypeApi } from "../services/recipeApi"; // API backend
import Footer from "../components/layout/Footer";

const ForYouPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  // Initialize meal plan from localStorage so it persists across reloads/close
  const initialMeals = (() => {
    try {
      const raw = localStorage.getItem("mealPlan");
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Error reading stored meal plan:", err);
      return [];
    }
  })();

  const [mealFromAI, setMealFromAI] = useState(initialMeals);
  const [hasMealPlan, setHasMealPlan] = useState(
    Array.isArray(initialMeals) && initialMeals.length > 0
  );
  const [userPreferences, setUserPreferences] = useState({});

  const [viewMode, setViewMode] = useState("today");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  // Note: meal detail modal is rendered by MealSelectionProvider to avoid prop drilling

  // Xử lý tạo payload gửi lên backend
  const buildPayload = (form) => {
    const budgetMap = { low: 10000, medium: 45000, high: 100000 };
    const regionMap = { North: "Bắc", Central: "Trung", South: "Nam" };
    const payload = {
      avoid_allergens: form.allergies || [],
      budget_vnd: budgetMap[form.budget] || 60000,
      region: regionMap[form.region] || "Bắc",
    };

    switch (form.dietType) {
      case "eat-clean":
        payload.eatclean = true;
        payload.max_calories_per_meal = form.dietaryGoal === "lose" ? 200 : 800;
        break;
      case "keto":
        payload.keto = true;
        payload.diet_tags = ["keto"];
        break;
      case "vegan":
        payload.vegetarian = true;
        payload.diet_tags = ["vegetarian"];
        break;
      default:
        break;
    }

    if (form.dietaryGoal === "gain") {
      payload.goal = "muscle_gain";
      payload.min_protein_g = 18;
    }

    return payload;
  };

  // Gọi API gợi ý thực đơn
  const handleGeneratePlan = async (preferences) => {
    setIsGenerating(true);
    try {
      const payload = buildPayload(preferences);
      const res = await suggestMenuApi(payload);
      const items = res.items || [];
      // Save new plan to state and persist to localStorage
      setMealFromAI(items);
      setHasMealPlan(Array.isArray(items) && items.length > 0);
      setUserPreferences(payload); // Lưu preferences để dùng khi swap
      try {
        localStorage.setItem("mealPlan", JSON.stringify(items));
      } catch (err) {
        console.error("Failed to persist meal plan:", err);
      }
    } catch (err) {
      console.error(err);
      alert(
        "Không lấy được thực đơn từ backend. Kiểm tra server 5000 chạy chưa."
      );
      setMealFromAI([]);
      setHasMealPlan(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPlan = () => {
    setMealFromAI([]);
    setHasMealPlan(false);
    try {
      localStorage.removeItem("mealPlan");
    } catch (err) {
      console.error("Failed to remove mealPlan from localStorage:", err);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === "weekly") setSelectedDay(new Date().getDay());
  };

  // Handle swap meal type
  const handleSwapMeal = async (mealType) => {
    setIsSwapping(true);
    try {
      // Call API to get new meals for this type
      const payload = { ...userPreferences, mealType };
      const res = await swapMealTypeApi(mealType, userPreferences);
      const newItems = res.items || [];

      // Update mealFromAI by replacing old meals of this type with new ones
      const updatedMeals = mealFromAI.filter((meal) => {
        const mealTypes = meal.meal_types || [];
        return !mealTypes.includes(mealType);
      });

      // Add new meals of this type
      const newMealsForType = newItems.filter((meal) => {
        const mealTypes = meal.meal_types || [];
        return mealTypes.includes(mealType);
      });

      const finalMeals = [...updatedMeals, ...newMealsForType];
      setMealFromAI(finalMeals);

      try {
        localStorage.setItem("mealPlan", JSON.stringify(finalMeals));
      } catch (err) {
        console.error("Failed to persist swapped meal plan:", err);
      }
    } catch (err) {
      console.error("Error swapping meal:", err);
      alert(`Không thể thay đổi ${mealType}. Vui lòng thử lại.`);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UserInputForm
              onGenerate={handleGeneratePlan}
              isGenerating={isGenerating}
            />
          </div>

          {/* Content */}
          <div className="lg:col-span-2 space-y-6">
            {!hasMealPlan ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-950 rounded-2xl p-12 text-center border dark:border-gray-800 border-gray-300 shadow-sm"
              >
                <div className="text-6xl mb-4">🍜</div>
                <h2 className="text-2xl font-semibold mb-2">
                  Start Your Journey
                </h2>
                <p className="text-gray-400">
                  Hãy cho chúng tôi biết sở thích của bạn, để AI tạo ra kế hoạch
                  bữa ăn hoàn hảo cho riêng bạn.
                </p>
              </motion.div>
            ) : (
              <>
                <MealPlanView
                  viewMode={viewMode}
                  selectedDay={selectedDay}
                  onViewModeChange={handleViewModeChange}
                  onDayChange={setSelectedDay}
                  meals={mealFromAI}
                  onSwapMeal={handleSwapMeal}
                  isSwapping={isSwapping}
                />
                <div className="flex justify-center ">
                  <button
                    onClick={resetPlan}
                    className="text-sm px-6 py-3 rounded-md bg-red-500 text-red-100 hover:bg-red-100 hover:text-red-600 transition-colors"
                    aria-label="Reset meal plan"
                  >
                    Reset plan
                  </button>
                </div>
                <NutritionSummary
                  selectedDay={selectedDay}
                  viewMode={viewMode}
                />

                <SafetyNotice />
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
      {/* MealDetailModal is rendered once by MealSelectionProvider (global modal) */}
    </div>
  );
};

export default ForYouPage;
