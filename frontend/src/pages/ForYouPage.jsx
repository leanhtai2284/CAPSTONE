import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import UserInputForm from "../components/section/UserInputForm";
import MealPlanView from "../components/section/MealPlanView";
import NutritionSummary from "../components/section/NutritionSummary";
import CostSummary from "../components/section/CostSummary";
import SafetyNotice from "../components/section/SafetyNotice";
import useMealPlanner from "../hooks/useMealPlanner";
import Footer from "../components/layout/Footer";
import RestaurantMap from "../components/ui/RestaurantMap";
import { userService } from "../services/userService";
import { Loader2, Settings2 } from "lucide-react";
import { toast } from "react-toastify";

const REGION_TO_FRONTEND = {
  Bắc: "mien-bac",
  Trung: "mien-trung",
  Nam: "mien-nam",
};

const DIET_TO_DIET_TYPE = {
  clean: "eat-clean",
  keto: "keto",
  vegetarian: "vegan",
  normal: "traditional",
};

const ACTIVITY_LEVEL_MAP = {
  low: "sedentary",
  moderate: "moderate",
  high: "active",
  sedentary: "sedentary",
  active: "active",
};

const mapRegionToFrontend = (region) =>
  REGION_TO_FRONTEND[region] || "mien-nam";

const mapDietToDietType = (diet) => DIET_TO_DIET_TYPE[diet] || "eat-clean";

const normalizeActivityLevel = (activityLevel) =>
  ACTIVITY_LEVEL_MAP[activityLevel] || "moderate";

const hasCompletedOnboarding = (profileData) => {
  const preferences = profileData?.preferences || {};
  return Boolean(
    profileData?.name &&
    preferences?.region &&
    preferences?.familySize &&
    preferences?.activityLevel &&
    preferences?.goal &&
    preferences?.budget &&
    preferences?.diet,
  );
};

const buildInitialFormValues = (profileData) => {
  const preferences = profileData?.preferences || {};
  return {
    name: profileData?.name || "",
    region: mapRegionToFrontend(preferences.region),
    familySize: preferences.familySize?.toString() || "4",
    activityLevel: normalizeActivityLevel(preferences.activityLevel),
    dietaryGoal: preferences.goal || "maintain",
    budget: preferences.budget || "medium",
    dietType: mapDietToDietType(preferences.diet),
  };
};

const ForYouPage = () => {
  const [restaurantMeal, setRestaurantMeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMandatoryModal, setIsMandatoryModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [initialFormValues, setInitialFormValues] = useState(null);
  const [hasCompletedProfileFlow, setHasCompletedProfileFlow] = useState(false);
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

  const canShowMealPlan = hasCompletedProfileFlow && hasMealPlan;
  const shouldShowSummary = canShowMealPlan;

  const openEditModal = () => {
    setIsMandatoryModal(false);
    setIsModalOpen(true);
  };

  const handleProfileSaved = (values) => {
    setInitialFormValues(values);
    setHasCompletedProfileFlow(true);
    setIsMandatoryModal(false);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await userService.getProfile();
        const data = response?.data;
        if (!data) {
          setIsMandatoryModal(true);
          setIsModalOpen(true);
          setHasCompletedProfileFlow(false);
          resetPlan();
          return;
        }
        setInitialFormValues(buildInitialFormValues(data));

        const completed = hasCompletedOnboarding(data);
        setIsMandatoryModal(!completed);
        setIsModalOpen(!completed);
        setHasCompletedProfileFlow(completed);
        if (!completed) {
          resetPlan();
        }
      } catch (error) {
        setIsMandatoryModal(true);
        setIsModalOpen(true);
        setHasCompletedProfileFlow(false);
        resetPlan();
        toast.error(error.message || "Không thể tải thông tin hồ sơ");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-500" />
          <p className="text-slate-600 dark:text-slate-400">
            Đang tải thông tin của bạn...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white hover:bg-green-600 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            Tạo thực đơn mới
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN — MEAL PLAN */}
          <div className="lg:col-span-3 space-y-6">
            {!canShowMealPlan ? (
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
        {shouldShowSummary && (
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

      <UserInputForm
        isOpen={isModalOpen}
        forceRequired={isMandatoryModal}
        isGenerating={isGenerating}
        initialValues={initialFormValues}
        onGenerate={handleGeneratePlan}
        onClose={() => setIsModalOpen(false)}
        onProfileSaved={handleProfileSaved}
      />
    </div>
  );
};

export default ForYouPage;
