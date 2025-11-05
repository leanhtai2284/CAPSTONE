import React, { useState } from "react";
import { motion } from "framer-motion";
import UserInputForm from "../components/section/UserInputForm";
import MealPlanView from "../components/section/MealPlanView";
import NutritionSummary from "../components/section/NutritionSummary";
// ⚡ Import context provider
import { MealSelectionProvider } from "../context/MealSelectionContext";
import { suggestMenuApi } from "../services/recipeApi"; //goi api

const ForYouPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasMealPlan, setHasMealPlan] = useState(false);
  const [viewMode, setViewMode] = useState("today");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [mealFromAI, setMealFromAI] = useState([]); //  chỗ chứa kết quả từ API

  // chuyển form → payload cho backend rule-based
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
      case "traditional":
        // rule traditional đã ưu tiên region
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

  const handleSwapMeal = (mealId) => {
    // tạm thời chỉ log ra, sau này muốn gọi API đổi món thì viết tiếp
    console.log("Swap meal:", mealId);
  };

  const handleGeneratePlan = async (preferences) => {
    setIsGenerating(true);
    try {
      const payload = buildPayload(preferences);
      const res = await suggestMenuApi(payload); // gọi tới /api/recipes/suggest
      const items = res.items || [];
      setMealFromAI(items);
      setHasMealPlan(true);
    } catch (err) {
      console.error(err);
      alert(
        "Không lấy được thực đơn từ backend. Kiểm tra server 5000 chạy chưa."
      );
      setMealFromAI([]); // để xuống dưới thấy "chưa có dữ liệu"
      setHasMealPlan(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === "weekly") {
      setSelectedDay(new Date().getDay());
    }
  };

  return (
    <MealSelectionProvider>
      <div className="min-h-screen w-full">
        {/* Header */}
        <header className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-[#3CAEA3] bg-clip-text text-transparent">
              For You
            </h1>
            <p className="text-gray-400 mt-1">
              Your personalized meal planner powered by AI
            </p>
          </div>
        </header>

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
                    Hãy cho chúng tôi biết sở thích của bạn, để AI tạo ra kế
                    hoạch bữa ăn hoàn hảo cho riêng bạn.
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
                  />
                  <NutritionSummary
                    selectedDay={selectedDay}
                    viewMode={viewMode}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MealSelectionProvider>
  );
};

export default ForYouPage;
