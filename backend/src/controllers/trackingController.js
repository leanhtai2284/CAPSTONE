import Recipe from "../models/Recipe.js";
import Pantry from "../models/Pantry.js";
import DailyTracking from "../models/DailyTracking.js";
import User from "../models/User.js";
import { calcTDEE, getFallbackCalorieTarget } from "../utils/tdee.js";

// ─────────────────────────────────────────────────────────
// Helper: Lấy mục tiêu calo từ TDEE (ưu tiên) hoặc fallback
// ─────────────────────────────────────────────────────────
async function getCalorieTarget(userId) {
  const user = await User.findById(userId)
    .select("fitnessProfile preferences.goal preferences.activityLevel")
    .lean();

  const tdee = calcTDEE(
    user?.fitnessProfile,
    user?.preferences?.activityLevel,
    user?.preferences?.goal
  );

  if (tdee) return { target: tdee.daily_calorie_target, is_estimated: false, tdee };
  return {
    target: getFallbackCalorieTarget(user?.preferences?.goal),
    is_estimated: true,
    tdee: null,
  };
}

// ─────────────────────────────────────────────────────────
// Helper: Tính progress so với mục tiêu
// ─────────────────────────────────────────────────────────
function calcProgress(dailyTotals, calorieTarget) {
  const consumed = dailyTotals?.calories ?? 0;
  const pct = Math.round((consumed / calorieTarget) * 100);
  let status = "on_track";
  if (pct >= 110) status = "over";
  else if (pct < 60) status = "under";

  return {
    calorie_target: calorieTarget,
    calories_consumed: consumed,
    calories_remaining: Math.max(calorieTarget - consumed, 0),
    calories_pct: pct,
    status, // "on_track" | "under" | "over"
  };
}

/**
 * POST /api/tracking/mark-as-cooked
 * Đánh dấu đã nấu một món:
 *   1. Trừ nguyên liệu khỏi Tủ lạnh (Pantry)
 *   2. Cộng dinh dưỡng vào Tracking hôm nay (DailyTracking)
 *   3. Trả về progress so với mục tiêu calo ngày
 */
export async function markAsCooked(req, res) {
  try {
    const userId = req.user._id;
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ success: false, message: "recipeId là bắt buộc" });
    }

    // 1. Lấy thông tin công thức
    const recipe = await Recipe.findById(recipeId).lean();
    if (!recipe) {
      return res.status(404).json({ success: false, message: "Không tìm thấy món ăn" });
    }

    // 2. Lấy tủ lạnh của user
    const pantryItems = await Pantry.find({ user: userId });

    // 3. Trừ nguyên liệu trong tủ lạnh
    const pantryLog = [];

    for (const ingredient of recipe.ingredients || []) {
      const ingName   = String(ingredient.name || "").toLowerCase().trim();
      const ingAmount = Number(ingredient.amount) || 0;
      const ingUnit   = String(ingredient.unit || "").toLowerCase();

      const pantryItem = pantryItems.find((p) =>
        String(p.name).toLowerCase().includes(ingName) ||
        ingName.includes(String(p.name).toLowerCase())
      );

      if (pantryItem && pantryItem.unit === ingUnit) {
        const newQty = pantryItem.quantity - ingAmount;
        if (newQty <= 0) {
          await Pantry.findByIdAndDelete(pantryItem._id);
          pantryLog.push({ name: pantryItem.name, action: "removed", reason: "Đã dùng hết" });
        } else {
          await Pantry.findByIdAndUpdate(pantryItem._id, { quantity: newQty });
          pantryLog.push({
            name: pantryItem.name,
            action: "updated",
            before: pantryItem.quantity,
            after: parseFloat(newQty.toFixed(2)),
            unit: pantryItem.unit,
          });
        }
      }
    }

    // 4. Cộng dinh dưỡng vào DailyTracking hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nutrition = recipe.nutrition || {};
    const mealEntry = {
      recipeId: recipe._id,
      name_vi: recipe.name_vi,
      eaten_at: new Date(),
      nutrition: {
        calories:   nutrition.calories   || 0,
        protein_g:  nutrition.protein_g  || 0,
        carbs_g:    nutrition.carbs_g    || 0,
        fat_g:      nutrition.fat_g      || 0,
        fiber_g:    nutrition.fiber_g    || 0,
        sodium_mg:  nutrition.sodium_mg  || 0,
        sugar_g:    nutrition.sugar_g    || 0,
      },
    };

    const tracking = await DailyTracking.findOneAndUpdate(
      { user: userId, date: today },
      {
        $push: { meals_eaten: mealEntry },
        $inc: {
          "daily_totals.calories":  mealEntry.nutrition.calories,
          "daily_totals.protein_g": mealEntry.nutrition.protein_g,
          "daily_totals.carbs_g":   mealEntry.nutrition.carbs_g,
          "daily_totals.fat_g":     mealEntry.nutrition.fat_g,
          "daily_totals.fiber_g":   mealEntry.nutrition.fiber_g,
          "daily_totals.sodium_mg": mealEntry.nutrition.sodium_mg,
          "daily_totals.sugar_g":   mealEntry.nutrition.sugar_g,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // 5. Tính progress dùng TDEE thực tế
    const { target: calorieTarget, is_estimated, tdee } = await getCalorieTarget(userId);
    const progress = calcProgress(tracking.daily_totals, calorieTarget);

    return res.json({
      success: true,
      message: `Đã ghi nhận bạn vừa nấu "${recipe.name_vi}"`,
      data: {
        pantry_deducted: pantryLog,
        today_totals: tracking.daily_totals,
        progress: {
          ...progress,
          is_estimated,
          macro_targets: tdee?.macro_targets ?? null,
        },
      },
    });
  } catch (err) {
    console.error("[markAsCooked]", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

/**
 * GET /api/tracking/today
 * Lấy tổng dinh dưỡng hôm nay + progress so với mục tiêu
 */
export async function getTodayTracking(req, res) {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Lấy mục tiêu calo từ TDEE (hoặc fallback)
    const { target: calorieTarget, is_estimated, tdee } = await getCalorieTarget(userId);

    const tracking = await DailyTracking.findOne({ user: userId, date: today }).lean();

    const progressMeta = { is_estimated, macro_targets: tdee?.macro_targets ?? null };

    if (!tracking) {
      const emptyTotals = {
        calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0,
        fiber_g: 0, sodium_mg: 0, sugar_g: 0,
      };
      return res.json({
        success: true,
        message: "Hôm nay chưa có dữ liệu tracking",
        data: {
          meals_eaten: [],
          daily_totals: emptyTotals,
          progress: { ...calcProgress(emptyTotals, calorieTarget), ...progressMeta },
        },
      });
    }

    return res.json({
      success: true,
      data: {
        ...tracking,
        progress: { ...calcProgress(tracking.daily_totals, calorieTarget), ...progressMeta },
      },
    });
  } catch (err) {
    console.error("[getTodayTracking]", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

/**
 * GET /api/tracking/history?days=7
 * Lấy lịch sử tracking theo số ngày (tối đa 30)
 */
export async function getTrackingHistory(req, res) {
  try {
    const userId = req.user._id;
    const days = Math.min(parseInt(req.query.days) || 7, 30);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    fromDate.setHours(0, 0, 0, 0);

    // Lấy TDEE để hiển thị mục tiêu calo trong history
    const { target: calorieTarget, is_estimated, tdee } = await getCalorieTarget(userId);

    const history = await DailyTracking.find({
      user: userId,
      date: { $gte: fromDate },
    })
      .sort({ date: -1 })
      .lean();

    // Gắn progress vào từng ngày
    const historyWithProgress = history.map((day) => ({
      ...day,
      progress: {
        ...calcProgress(day.daily_totals, calorieTarget),
        is_estimated,
        macro_targets: tdee?.macro_targets ?? null,
      },
    }));

    return res.json({ success: true, data: historyWithProgress });
  } catch (err) {
    console.error("[getTrackingHistory]", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}
