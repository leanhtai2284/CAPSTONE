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
    const start = req.query.start ? new Date(req.query.start) : startOfWeek(new Date());
    const end = req.query.end ? new Date(req.query.end) : endOfWeek(new Date());

    const totalDays = diffDays(new Date(start), new Date(end)) + 1;
    const labels = [];
    for (let i = 0; i < totalDays; i++) {
      labels.push(addDays(new Date(start), i));
    }

    const nutritionData = labels.map((d, idx) => ({
      day: labelForDay(d, period === "daily" ? "daily" : "weekly"),
      protein: 80 + ((idx * 7) % 20),
      carbs: 210 + ((idx * 13) % 50),
      fat: 60 + ((idx * 5) % 15),
      calories: 1800 + ((idx * 70) % 400),
    }));

    const totals = nutritionData.reduce(
      (acc, cur) => {
        acc.total_meals += 3;
        acc.total_calories += cur.calories;
        acc.protein += cur.protein;
        acc.carbs += cur.carbs;
        acc.fat += cur.fat;
        return acc;
      },
      { total_meals: 0, total_calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const avg_protein = +(totals.protein / totalDays).toFixed(1);
    const avg_carbs = +(totals.carbs / totalDays).toFixed(1);
    const avg_fat = +(totals.fat / totalDays).toFixed(1);

    const report = {
      _id: "mock",
      user_id: userId || null,
      period_type: period, // weekly | daily
      start_date: toDateOnlyString(new Date(start)),
      end_date: toDateOnlyString(new Date(end)),
      total_meals: totals.total_meals,
      total_calories: totals.total_calories,
      avg_protein,
      avg_carbs,
      avg_fat,
      diet_score: 85.2,
      notes:
        "Bạn đang duy trì chế độ ăn tốt! Hãy ưu tiên thêm protein vào bữa sáng để đạt hiệu quả cao hơn.",
      created_at: new Date().toISOString(),
    };

    return res.json({ report, nutritionData });
  } catch (error) {
    console.error("getUserNutritionReport error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default { getUserNutritionReport };
