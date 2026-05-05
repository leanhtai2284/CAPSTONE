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
    const budgetMap = { low: 180000, medium: 270000, high: 390000 };
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

    // 3) Xử lý goal theo dietaryGoal
    if (form.dietaryGoal === "gain") {
      // Tăng cân + ít vận động => ưu tiên carbs
      if (form.activityLevel === "sedentary") {
        payload.goal = "weight_gain";
        payload.min_calories_per_meal = 650;
        payload.min_carbs_g = 60; // nhiều tinh bột
      } else {
        // Tăng cân + vận động => tập cơ
        payload.goal = "muscle_gain";
        payload.min_protein_g = 20;
        payload.min_calories_per_meal = 700;
      }
    } else if (form.dietaryGoal === "lose") {
      payload.goal = "weight_loss";
      payload.max_calories_per_meal = Math.round(450 * activityFactor);
      payload.min_protein_g = 15;
      payload.min_fiber_g = 3;
    } else {
      // maintain - không set goal
      payload.max_calories_per_meal = maxCaloriesPerMeal;
    }

    // 4) Xử lý diet type
    switch (form.dietType) {
      case "eat-clean":
        payload.eatclean = true;
        if (!payload.max_calories_per_meal) {
          payload.max_calories_per_meal = maxCaloriesPerMeal;
        }
        payload.diet_tags = ["eatclean"];
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
        payload.diet_tags = [];
        break;
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

  // ...existing code...

  const handleSwapMeal = async (mealId) => {
    if (!mealId || isSwapping) return;

    setIsSwapping(mealId);
    try {
      // 1️ Tìm món cần đổi trong meal plan
      let currentMeal = null;
      let currentMeals = []; // Tất cả món trong bữa ăn hiện tại

      if (
        viewMode === "weekly" &&
        Array.isArray(weeklyMenu) &&
        weeklyMenu.length
      ) {
        const dayObj =
          weeklyMenu.find((d) => d.day === selectedDay) ||
          weeklyMenu[selectedDay];
        if (dayObj && dayObj.meals) {
          currentMeals = dayObj.meals;
          currentMeal = dayObj.meals.find(
            (m) => m._id === mealId || m.id === mealId
          );
        }
      } else {
        currentMeals = mealFromAI;
        currentMeal = mealFromAI.find(
          (m) => m._id === mealId || m.id === mealId
        );
      }

      if (!currentMeal) {
        throw new Error("Không tìm thấy món cần đổi");
      }

      // 2️ Lấy diet_tags từ userPreferences
      const dietTags = userPreferences.diet_tags || [];

      // 3️ Loại trừ TẤT CẢ món đang có trong bữa ăn (không chỉ món đang swap)
      const excludeIds = currentMeals.map((m) => m._id || m.id).filter(Boolean);

      console.log("🔄 Đổi món:", {
        mealId,
        mealName: currentMeal.name_vi,
        mealType: currentMeal.meal_types?.[0],
        dietTags,
        excludeIds,
      });

      // 4️ Gọi API với meal object, dietTags và excludeIds
      const result = await swapSingleMealApi(currentMeal, dietTags, excludeIds);

      if (!result.meal) {
        throw new Error("Không có món thay thế phù hợp");
      }

      const newMeal = {
        ...result.meal,
        // Thêm timestamp để đảm bảo unique key khi swap
        _swapId: `${result.meal._id || result.meal.id}_${Date.now()}`,
      };

      console.log(" Đổi thành:", newMeal.name_vi);

      // 4️ Cập nhật meal plan - CHỈ THAY THẾ MÓN ĐÓ
      if (
        viewMode === "weekly" &&
        Array.isArray(weeklyMenu) &&
        weeklyMenu.length
      ) {
        const updatedWeekly = weeklyMenu.map((dayObj) => {
          if (dayObj.day === selectedDay) {
            return {
              ...dayObj,
              meals: (dayObj.meals || []).map(
                (m) => (m._id === mealId || m.id === mealId ? newMeal : m) // CHỈ THAY MÓN NÀY
              ),
            };
          }
          return dayObj;
        });
        setWeeklyMenu(updatedWeekly);
      } else {
        // Today mode
        const updatedMeals = mealFromAI.map(
          (m) => (m._id === mealId || m.id === mealId ? newMeal : m) // CHỈ THAY MÓN NÀY
        );
        setMealFromAI(updatedMeals);
      }

      toast.success(`Đã đổi thành: ${newMeal.name_vi || "món mới"}!`);
    } catch (err) {
      console.error(" Error swapping meal:", err);
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

      toast.success("Đã lưu thực đơn!");
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
