import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import UserInputForm from "../components/section/UserInputForm";
import MealPlanView from "../components/section/MealPlanView";
import NutritionSummary from "../components/section/NutritionSummary";
import SafetyNotice from "../components/section/SafetyNotice";
// Modal is provided globally by MealSelectionProvider; do not render here to avoid duplicates
import {
  suggestMenuApi,
  suggestWeeklyApi,
  swapMealTypeApi,
} from "../services/recipeApi"; // API backend
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

  const initialWeekly = (() => {
    try {
      const raw = localStorage.getItem("weeklyMenu");
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Error reading stored weekly menu:", err);
      return [];
    }
  })();

  const [mealFromAI, setMealFromAI] = useState(initialMeals);
  const [weeklyMenu, setWeeklyMenu] = useState(initialWeekly);
  const [hasMealPlan, setHasMealPlan] = useState(
    (Array.isArray(initialMeals) && initialMeals.length > 0) ||
      (Array.isArray(initialWeekly) && initialWeekly.length > 0)
  );
  const [userPreferences, setUserPreferences] = useState({});

  const [viewMode, setViewMode] = useState("today");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  // Computed list of meals to display for the current view/selected day
  const displayedMeals = useMemo(() => {
    if (viewMode === "weekly") {
      if (Array.isArray(weeklyMenu) && weeklyMenu.length) {
        const dayObj =
          weeklyMenu.find((d) => d.day === selectedDay) ||
          weeklyMenu[selectedDay] ||
          null;
        return (dayObj && Array.isArray(dayObj.meals) && dayObj.meals) || [];
      }
      return [];
    }
    return Array.isArray(mealFromAI) ? mealFromAI : [];
  }, [viewMode, weeklyMenu, mealFromAI, selectedDay]);
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

      if (viewMode === "weekly") {
        const res = await suggestWeeklyApi(payload);
        const menu = res.weeklyMenu || [];

        setWeeklyMenu(menu);
        setMealFromAI([]);
        setHasMealPlan(Array.isArray(menu) && menu.length > 0);
        setUserPreferences(payload);
        setSelectedDay(new Date().getDay());
        try {
          localStorage.setItem("weeklyMenu", JSON.stringify(menu));
        } catch (err) {
          console.error("Failed to persist weekly menu:", err);
        }
      } else {
        // Default: generate for today
        const res = await suggestMenuApi(payload);
        const items = res.items || [];
        setMealFromAI(items);
        setHasMealPlan(Array.isArray(items) && items.length > 0);
        setUserPreferences(payload);
        setViewMode("today");
        try {
          localStorage.setItem("mealPlan", JSON.stringify(items));
        } catch (err) {
          console.error("Failed to persist meal plan:", err);
        }
      }
    } catch (err) {
      console.error(err);
      alert(
        "Không lấy được thực đơn từ backend. Kiểm tra server 5000 chạy chưa."
      );
      setMealFromAI([]);
      setWeeklyMenu([]);
      setHasMealPlan(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPlan = () => {
    setMealFromAI([]);
    setHasMealPlan(false);
    setWeeklyMenu([]);
    try {
      localStorage.removeItem("mealPlan");
      localStorage.removeItem("weeklyMenu");
    } catch (err) {
      console.error("Failed to remove mealPlan from localStorage:", err);
    }
  };

  const handleViewModeChange = async (mode) => {
    // If user switched to weekly, attempt to fetch weekly menu when we don't have it yet
    setViewMode(mode);
    if (mode === "weekly") {
      setSelectedDay(new Date().getDay());

      if (!Array.isArray(weeklyMenu) || weeklyMenu.length === 0) {
        // Need previous preferences to request weekly; if none, ask user to generate first
        if (!userPreferences || Object.keys(userPreferences).length === 0) {
          alert("Vui lòng tạo thực đơn (Today) trước khi chuyển sang Weekly.");
          setViewMode("today");
          return;
        }

        try {
          setIsGenerating(true);
          const res = await suggestWeeklyApi(userPreferences);
          const menu = res.weeklyMenu || [];
          setWeeklyMenu(menu);
          setHasMealPlan(Array.isArray(menu) && menu.length > 0);
          try {
            localStorage.setItem("weeklyMenu", JSON.stringify(menu));
          } catch (err) {
            console.error("Failed to persist weekly menu:", err);
          }
        } catch (err) {
          console.error("Failed to load weekly menu:", err);
          alert("Không thể tải thực đơn tuần. Vui lòng thử lại.");
          setViewMode("today");
        } finally {
          setIsGenerating(false);
        }
      }
    }
  };

  // Handle swap meal type
  const handleSwapMeal = async (mealType) => {
    setIsSwapping(true);
    try {
      // Call API to get new meals for this type
      const res = await swapMealTypeApi(mealType, userPreferences);
      const newItems = res.items || [];

      // If we're in weekly mode, replace the meal for the selectedDay
      if (
        viewMode === "weekly" &&
        Array.isArray(weeklyMenu) &&
        weeklyMenu.length
      ) {
        const dayIndex = selectedDay;
        const dayObj =
          weeklyMenu.find((d) => d.day === dayIndex) || weeklyMenu[dayIndex];
        if (dayObj) {
          const updatedDayMeals = (dayObj.meals || []).map((m) => {
            const types = m.meal_types || [];
            if (types.includes(mealType)) {
              // find replacement from newItems with same mealType
              const replacement = newItems.find((nm) =>
                (nm.meal_types || []).includes(mealType)
              );
              return replacement || m;
            }
            return m;
          });

          const updatedWeekly = weeklyMenu.map((d) =>
            d.day === dayObj.day ? { ...d, meals: updatedDayMeals } : d
          );
          setWeeklyMenu(updatedWeekly);
          try {
            localStorage.setItem("weeklyMenu", JSON.stringify(updatedWeekly));
          } catch (err) {
            console.error("Failed to persist swapped weekly menu:", err);
          }
        }
      } else {
        // Fallback: single-day plan swap (legacy behaviour)
        const updatedMeals = mealFromAI.filter((meal) => {
          const mealTypes = meal.meal_types || [];
          return !mealTypes.includes(mealType);
        });

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
      }
    } catch (err) {
      console.error("Error swapping meal:", err);
      alert(`Không thể thay đổi ${mealType}. Vui lòng thử lại.`);
    } finally {
      setIsSwapping(false);
    }
  };

  // Handle save daily menu
  const handleSaveDailyMenu = (meals, selectedDay) => {
    if (!meals || meals.length === 0) {
      toast.error("Không có thực đơn để lưu!", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    try {
      const savedMenus =
        JSON.parse(localStorage.getItem("savedDailyMenus")) || [];

      // Tạo thực đơn mới với thông tin ngày
      const dayNames = [
        "Chủ nhật",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
      ];
      const dayName = dayNames[selectedDay] || "Hôm nay";
      const savedDate = new Date().toISOString();

      const newMenu = {
        id: `menu-${Date.now()}`,
        date: savedDate,
        dayName: dayName,
        dayIndex: selectedDay,
        meals: meals,
        createdAt: savedDate,
      };

      // Kiểm tra xem đã có thực đơn cho ngày này chưa (nếu muốn chỉ lưu 1 thực đơn/ngày)
      // Hoặc luôn thêm mới (để có thể lưu nhiều thực đơn)
      const updatedMenus = [...savedMenus, newMenu];

      localStorage.setItem("savedDailyMenus", JSON.stringify(updatedMenus));

      toast.success("Đã lưu thực đơn thành công!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
      });
    } catch (err) {
      console.error("Failed to save daily menu:", err);
      toast.error("Không thể lưu thực đơn. Vui lòng thử lại!", {
        position: "top-right",
        autoClose: 2000,
      });
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
                  meals={displayedMeals}
                  onSwapMeal={handleSwapMeal}
                  isSwapping={isSwapping}
                  onSaveDailyMenu={handleSaveDailyMenu}
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
                  meals={displayedMeals}
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
