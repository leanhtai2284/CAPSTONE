/**
 * Tiện ích tính TDEE (Total Daily Energy Expenditure)
 * Công thức: Mifflin-St Jeor (chuẩn khuyến nghị bởi các chuyên gia dinh dưỡng)
 */

// Hệ số hoạt động
const ACTIVITY_MULTIPLIER = {
  low:      1.2,    // Ít vận động (ngồi nhiều)
  moderate: 1.375,  // Vận động nhẹ (1-3 ngày/tuần)
  high:     1.55,   // Vận động nhiều (4-5 ngày/tuần)
};

// Điều chỉnh theo mục tiêu
const GOAL_ADJUSTMENT = {
  lose:     -400, // Thâm hụt calo để giảm cân
  maintain:    0, // Duy trì cân nặng
  gain:     +400, // Dư thừa calo để tăng cân
};

/**
 * Tính BMR theo Mifflin-St Jeor
 * @param {number} weight_kg
 * @param {number} height_cm
 * @param {number} age
 * @param {"male"|"female"} gender
 * @returns {number} BMR (kcal/ngày)
 */
export function calcBMR(weight_kg, height_cm, age, gender) {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return gender === "female" ? base - 161 : base + 5;
}

/**
 * Tính TDEE đầy đủ từ thông tin cá nhân
 * @param {object} fitnessProfile - { height_cm, weight_kg, age, gender }
 * @param {string} activityLevel  - "low" | "moderate" | "high"
 * @param {string} goal           - "lose" | "maintain" | "gain"
 * @returns {object} Kết quả TDEE chi tiết
 */
export function calcTDEE(fitnessProfile, activityLevel = "moderate", goal = "maintain") {
  const { height_cm, weight_kg, age, gender } = fitnessProfile || {};

  // Kiểm tra đủ dữ liệu chưa
  if (!height_cm || !weight_kg || !age || !gender) {
    return null; // Chưa đủ thông tin → trả null → dùng mặc định
  }

  const bmr  = Math.round(calcBMR(weight_kg, height_cm, age, gender));
  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIER[activityLevel] ?? 1.375));
  const goalAdj = GOAL_ADJUSTMENT[goal] ?? 0;
  const dailyCalorieTarget = Math.round(tdee + goalAdj);

  // Tính macro mục tiêu (phân bổ chuẩn dinh dưỡng)
  // Protein: 30% calo → 1g protein = 4 kcal
  // Fat:     25% calo → 1g fat = 9 kcal
  // Carbs:   45% calo → 1g carbs = 4 kcal
  const protein_g = Math.round((dailyCalorieTarget * 0.30) / 4);
  const fat_g     = Math.round((dailyCalorieTarget * 0.25) / 9);
  const carbs_g   = Math.round((dailyCalorieTarget * 0.45) / 4);

  // Calo mỗi bữa (sáng 25%, trưa 40%, tối 35%)
  const mealTargets = {
    breakfast: Math.round(dailyCalorieTarget * 0.25),
    lunch:     Math.round(dailyCalorieTarget * 0.40),
    dinner:    Math.round(dailyCalorieTarget * 0.35),
  };

  return {
    bmr,
    tdee,
    goal_adjustment: goalAdj,
    daily_calorie_target: dailyCalorieTarget,
    macro_targets: {
      protein_g,
      fat_g,
      carbs_g,
      calories: dailyCalorieTarget,
    },
    meal_calorie_targets: mealTargets,
    inputs: {
      height_cm,
      weight_kg,
      age,
      gender,
      activity_level: activityLevel,
      goal,
    },
  };
}

/**
 * Fallback: Mục tiêu calo đơn giản khi chưa có fitnessProfile
 */
export function getFallbackCalorieTarget(goal) {
  switch (goal) {
    case "lose":     return 1700;
    case "gain":     return 2500;
    case "maintain":
    default:         return 2000;
  }
}
