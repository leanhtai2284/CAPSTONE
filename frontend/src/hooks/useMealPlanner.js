import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import useLocalStorage from "./useLocalStorage";
import {
  suggestMenuApi,
  suggestWeeklyApi,
  swapSingleMealApi,
} from "../services/recipeApi";
import { dailyMenuService } from "../services/dailyMenuService";

export default function useMealPlanner() {
  const [mealFromAI, setMealFromAI, removeMealFromAI] = useLocalStorage(
    "mealPlan",
    []
  );
  const [weeklyMenu, setWeeklyMenu, removeWeeklyMenu] = useLocalStorage(
    "weeklyMenu",
    []
  );
  const [userPreferences, setUserPreferences] = useState({});

  const [viewMode, setViewMode] = useState("today");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(null); // Track which meal ID is swapping

  const hasMealPlan = useMemo(() => {
    return (
      (Array.isArray(mealFromAI) && mealFromAI.length > 0) ||
      (Array.isArray(weeklyMenu) && weeklyMenu.length > 0)
    );
  }, [mealFromAI, weeklyMenu]);

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

  const buildPayload = (form) => {
    const budgetMap = { low: 10000, medium: 45000, high: 100000 };
    const regionMap = { North: "Bắc", Central: "Trung", South: "Nam" };

    // 1) Hệ số theo mức độ hoạt động
    const activityFactorMap = {
      sedentary: 0.9, // ít vận động
      moderate: 1.0, // trung bình
      active: 1.1, // năng động
    };

    // 2) Calo cơ bản theo mục tiêu
    const baseCalsByGoal = {
      maintain: 600, // duy trì
      lose: 450, // giảm cân
      gain: 750, // tăng cân
    };

    const basePerMeal =
      baseCalsByGoal[form.dietaryGoal] || baseCalsByGoal.maintain;
    const activityFactor = activityFactorMap[form.activityLevel] || 1;
    const maxCaloriesPerMeal = Math.round(basePerMeal * activityFactor);

    const payload = {
      avoid_allergens: form.allergies || [],
      budget_vnd: budgetMap[form.budget] || 60000,
      region: regionMap[form.region] || "Bắc",
      activity_level: form.activityLevel,
    };

    switch (form.dietType) {
      case "eat-clean":
        payload.eatclean = true;
        payload.max_calories_per_meal = maxCaloriesPerMeal;
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

  const handleGeneratePlan = async (preferences) => {
    setIsGenerating(true);
    try {
      const payload = buildPayload(preferences);

      if (viewMode === "weekly") {
        const res = await suggestWeeklyApi(payload);
        const menu = res.weeklyMenu || [];

        setWeeklyMenu(menu);
        setMealFromAI([]);
        setUserPreferences(payload);
        setSelectedDay(new Date().getDay());
      } else {
        const res = await suggestMenuApi(payload);
        const items = res.items || [];
        setMealFromAI(items);
        setUserPreferences(payload);
        setViewMode("today");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        "Không lấy được thực đơn từ backend. Kiểm tra server đang chạy."
      );
      setMealFromAI([]);
      setWeeklyMenu([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPlan = () => {
    setMealFromAI([]);
    setWeeklyMenu([]);
    setUserPreferences({});
    try {
      removeMealFromAI();
      removeWeeklyMenu();
    } catch (err) {
      console.error("Failed to remove local storage keys:", err);
    }
  };

  const handleViewModeChange = async (mode) => {
    setViewMode(mode);
    if (mode === "weekly") {
      setSelectedDay(new Date().getDay());

      if (!Array.isArray(weeklyMenu) || weeklyMenu.length === 0) {
        if (!userPreferences || Object.keys(userPreferences).length === 0) {
          toast.info(
            "Vui lòng tạo thực đơn (Today) trước khi chuyển sang Weekly."
          );
          setViewMode("today");
          return;
        }

        try {
          setIsGenerating(true);
          const res = await suggestWeeklyApi(userPreferences);
          const menu = res.weeklyMenu || [];
          setWeeklyMenu(menu);
        } catch (err) {
          console.error("Failed to load weekly menu:", err);
          toast.error("Không thể tải thực đơn tuần. Vui lòng thử lại.");
          setViewMode("today");
        } finally {
          setIsGenerating(false);
        }
      }
    }
  };

  const handleSwapMeal = async (mealId) => {
    if (!mealId || isSwapping) return;

    setIsSwapping(mealId);
    try {
      const preferences = {
        dietaryRestrictions: userPreferences.diet_tags || [],
        cuisinePreferences: userPreferences.cuisinePreferences || [],
        avoidIngredients: userPreferences.avoidIngredients || [],
        allergies: userPreferences.avoid_allergens || [],
      };

      const result = await swapSingleMealApi(mealId, preferences);

      if (!result.meal) {
        throw new Error("No meal returned from swap API");
      }

      const newMeal = result.meal;

      // Update meal plan
      if (
        viewMode === "weekly" &&
        Array.isArray(weeklyMenu) &&
        weeklyMenu.length
      ) {
        const updatedWeekly = weeklyMenu.map((dayObj) => {
          if (dayObj.day === selectedDay) {
            return {
              ...dayObj,
              meals: (dayObj.meals || []).map((m) =>
                m._id === mealId || m.id === mealId ? newMeal : m
              ),
            };
          }
          return dayObj;
        });
        setWeeklyMenu(updatedWeekly);
      } else {
        // Today mode
        const updatedMeals = mealFromAI.map((m) =>
          m._id === mealId || m.id === mealId ? newMeal : m
        );
        setMealFromAI(updatedMeals);
      }

      toast.success("Đã đổi món thành công!");
    } catch (err) {
      console.error("Error swapping meal:", err);
      toast.error(err.message || "Không thể đổi món. Vui lòng thử lại.");
    } finally {
      setIsSwapping(null);
    }
  };

  const handleSaveDailyMenu = async (meals, dayIndex) => {
    if (!meals || meals.length === 0) {
      toast.error("Không có thực đơn để lưu!");
      return;
    }

    try {
      const dayNames = [
        "Chủ nhật",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
      ];
      const dayName = dayNames[dayIndex] || "Hôm nay";
      const savedDate = new Date().toISOString();

      const payload = {
        dayIndex,
        dayName,
        date: savedDate,
        meals,
      };

      await dailyMenuService.create(payload);

      toast.success("Đã lưu thực đơn lên server!");
    } catch (err) {
      console.error("Failed to save daily menu:", err);
      toast.error(err.message || "Không thể lưu thực đơn. Vui lòng thử lại!");
    }
  };

  return {
    mealFromAI,
    weeklyMenu,
    hasMealPlan,
    isGenerating,
    isSwapping,
    viewMode,
    selectedDay,
    displayedMeals,
    userPreferences,
    handleGeneratePlan,
    resetPlan,
    handleViewModeChange,
    setSelectedDay,
    handleSwapMeal,
    handleSaveDailyMenu,
    setViewMode,
  };
}
