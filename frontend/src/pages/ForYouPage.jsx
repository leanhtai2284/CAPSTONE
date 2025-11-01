import React, { useState } from "react";
import { motion } from "framer-motion";
import UserInputForm from "../components/section/UserInputForm";
import MealPlanView from "../components/section/MealPlanView";
import NutritionSummary from "../components/section/NutritionSummary";
// ⚡ Import context provider
import { MealSelectionProvider } from "../context/MealSelectionContext";

const ForYouPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasMealPlan, setHasMealPlan] = useState(false);
  const [viewMode, setViewMode] = useState("today");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const handleGeneratePlan = async (preferences) => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsGenerating(false);
    setHasMealPlan(true);
  };

  const handleSwapMeal = (mealId) => {
    console.log("Swapping meal:", mealId);
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
