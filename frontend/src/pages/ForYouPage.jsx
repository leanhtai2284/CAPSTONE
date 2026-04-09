import React, { useState } from "react";
import { motion } from "framer-motion";
import UserInputForm from "../components/section/UserInputForm";
import MealPlanView from "../components/section/MealPlanView";
import NutritionSummary from "../components/section/NutritionSummary";
import CostSummary from "../components/section/CostSummary";
import SafetyNotice from "../components/section/SafetyNotice";
import useMealPlanner from "../hooks/useMealPlanner";
import Footer from "../components/layout/Footer";
import RestaurantMap from "../components/ui/RestaurantMap";

const ForYouPage = () => {
  const [restaurantMeal, setRestaurantMeal] = useState(null);
  const {
    hasMealPlan,
    isGenerating,
    isSwapping,
    viewMode,
    selectedDay,
    displayedMeals,
    handleGeneratePlan,
    resetPlan,
    handleViewModeChange,
    setSelectedDay,
    handleSwapMeal,
    handleSaveDailyMenu,
  } = useMealPlanner();

  return (
    <div className="min-h-screen w-full">
      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN — INPUT FORM */}
          <div className="lg:col-span-1">
            <UserInputForm
              onGenerate={handleGeneratePlan}
              isGenerating={isGenerating}
            />
          </div>

          {/* RIGHT COLUMN — MEAL PLAN */}
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
                  meals={displayedMeals}
                  onSwapMeal={handleSwapMeal}
                  onFindNearby={setRestaurantMeal}
                  isSwapping={isSwapping}
                  onSaveDailyMenu={handleSaveDailyMenu}
                  onResetPlan={resetPlan}
                />
              </>
            )}
          </div>
        </div>

        {/* ⭐ FULL-WIDTH SECTION UNDERNEATH — SUMMARY */}
        {hasMealPlan && (
          <div className="mt-12 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NutritionSummary
                selectedDay={selectedDay}
                viewMode={viewMode}
                meals={displayedMeals}
              />
              <CostSummary
                meals={displayedMeals}
                viewMode={viewMode}
                selectedDay={selectedDay}
              />
            </div>

            <SafetyNotice />
          </div>
        )}
      </div>

      <Footer />

      {restaurantMeal ? (
        <RestaurantMap
          meal={restaurantMeal}
          onClose={() => setRestaurantMeal(null)}
        />
      ) : null}
    </div>
  );
};

export default ForYouPage;
