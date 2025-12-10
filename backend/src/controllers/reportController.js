import DailyMenu from "../models/DailyMenu.js";
import NutritionFact from "../models/NutritionFact.js";
import Recipe from "../models/Recipe.js";

// Utilities
function toDateOnlyString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d, days) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
}

function diffDays(a, b) {
  const ms = b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0);
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function startOfWeek(d) {
  const nd = new Date(d);
  const day = nd.getDay(); // 0=CN, 1=T2
  const diff = (day === 0 ? -6 : 1) - day; // bắt đầu tuần là Thứ 2
  nd.setDate(nd.getDate() + diff);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

function endOfWeek(d) {
  const sow = startOfWeek(d);
  const eow = addDays(sow, 6);
  eow.setHours(23, 59, 59, 999);
  return eow;
}

function labelForDay(date, mode) {
  if (mode === "weekly") {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[date.getDay()];
  }
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

// Trả về dữ liệu báo cáo dinh dưỡng cho user
// GET /api/reports/nutrition?period=weekly|daily&start=YYYY-MM-DD&end=YYYY-MM-DD
export const getUserNutritionReport = async (req, res) => {
  try {
    const userId = req.user?._id;
    const period = (req.query.period || "weekly").toLowerCase();
    let start = req.query.start ? new Date(req.query.start) : startOfWeek(new Date());
    let end = req.query.end ? new Date(req.query.end) : endOfWeek(new Date());

    // Nếu FE yêu cầu `daily` nhưng không truyền start, mặc định chỉ lấy dữ liệu của hôm nay
    if (period === "daily" && !req.query.start && !req.query.end) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      start = new Date(today);
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
    }

    // Lấy các DailyMenu của user trong khoảng thời gian
    const dailyMenus = await DailyMenu.find({
      user: userId,
      date: { $gte: start, $lte: end }
    }).lean();

    // Chuẩn bị dữ liệu dinh dưỡng từng ngày
    const nutritionData = [];
    let total_meals = 0, total_calories = 0, total_protein = 0, total_carbs = 0, total_fat = 0;

    // Sắp xếp theo ngày tăng dần để biểu đồ hiển thị đúng trình tự
    dailyMenus.sort((a, b) => new Date(a.date) - new Date(b.date));

    for (const menu of dailyMenus) {
      let dayCalories = 0, dayProtein = 0, dayCarbs = 0, dayFat = 0, mealCount = 0;
      for (const meal of menu.meals) {
        mealCount++;
        // meal có thể chứa nutrition trực tiếp hoặc tham chiếu recipe
        let nutrition = meal.nutrition;
        if (!nutrition && meal.recipeId) {
          // Nếu meal chỉ có recipeId, lấy NutritionFact
          nutrition = await NutritionFact.findOne({ recipeId: meal.recipeId }).lean();
        }
        if (nutrition) {
          dayCalories += nutrition.calories || 0;
          dayProtein += nutrition.protein_g || nutrition.protein || 0;
          dayCarbs += nutrition.carbs_g || nutrition.carbs || 0;
          dayFat += nutrition.fat_g || nutrition.fat || 0;
        }
      }
      total_meals += mealCount;
      total_calories += dayCalories;
      total_protein += dayProtein;
      total_carbs += dayCarbs;
      total_fat += dayFat;
      // Sử dụng dayName (nếu FE đã lưu) để tránh lệch do timezone hoặc parse date
      const dayLabel = menu.dayName
        || (typeof menu.dayIndex === 'number' ?
            // map dayIndex (0-6) -> label (T2..CN)
            (['T2','T3','T4','T5','T6','T7','CN'][menu.dayIndex] || labelForDay(new Date(menu.date), period === "daily" ? "daily" : "weekly"))
            : labelForDay(new Date(menu.date), period === "daily" ? "daily" : "weekly")
        );

      nutritionData.push({
        day: dayLabel,
        calories: dayCalories,
        protein: dayProtein,
        carbs: dayCarbs,
        fat: dayFat,
        meals: mealCount,
        date: toDateOnlyString(new Date(menu.date))
      });
    }

    const totalDays = dailyMenus.length || 1;
    const avg_protein = +(total_protein / totalDays).toFixed(1);
    const avg_carbs = +(total_carbs / totalDays).toFixed(1);
    const avg_fat = +(total_fat / totalDays).toFixed(1);

    // Tính điểm dinh dưỡng dựa trên phân bố calo giữa protein/carbs/fat
    // calories per gram: protein=4, carbs=4, fat=9
    let diet_score = 0;
    if (total_calories > 0) {
      const proteinCals = total_protein * 4;
      const carbsCals = total_carbs * 4;
      const fatCals = total_fat * 9;

      const p = proteinCals / total_calories;
      const c = carbsCals / total_calories;
      const f = fatCals / total_calories;

      const desired = { p: 0.2, c: 0.5, f: 0.3 };
      const deviation = (Math.abs(p - desired.p) + Math.abs(c - desired.c) + Math.abs(f - desired.f)) / 3; // 0..1
      diet_score = Math.max(0, Math.round((1 - deviation) * 100 * 10) / 10); // 1 decimal
    }

    // Gợi ý theo mức điểm
    let notes = "Cần cải thiện chế độ ăn.";
    if (diet_score >= 75) notes = "Bạn đang duy trì chế độ ăn tốt!";
    else if (diet_score >= 50) notes = "Chế độ ăn ổn nhưng có thể cải thiện.";

    const report = {
      _id: userId,
      user_id: userId || null,
      period_type: period,
      start_date: toDateOnlyString(new Date(start)),
      end_date: toDateOnlyString(new Date(end)),
      total_meals,
      total_calories,
      avg_daily_calories: +(total_calories / totalDays).toFixed(1),
      avg_protein,
      avg_carbs,
      avg_fat,
      diet_score,
      notes,
      created_at: new Date().toISOString(),
    };

    // Calorie alert thresholds (default): warning >2200 kcal/day, danger >2700 kcal/day
    const avg_daily = total_calories / totalDays;
    let calorie_alert = { level: "ok", message: "" };
    if (avg_daily > 2700) {
      calorie_alert = { level: "danger", message: `Lượng calo trung bình/ngày cao (${Math.round(avg_daily)} kcal). Cần giảm.` };
    } else if (avg_daily > 2200) {
      calorie_alert = { level: "warning", message: `Lượng calo trung bình/ngày hơi cao (${Math.round(avg_daily)} kcal). Cân nhắc điều chỉnh.` };
    }

    report.calorie_alert = calorie_alert;

    return res.json({ report, nutritionData });
  } catch (error) {
    console.error("getUserNutritionReport error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default { getUserNutritionReport };
