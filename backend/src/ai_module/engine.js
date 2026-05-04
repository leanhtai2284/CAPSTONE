import Recipe from "../models/Recipe.js";
import applyDiet from "./rules/diet.js";
import applyTraditional from "./rules/traditional.js";
import applyHighProtein from "./rules/high_protein.js";
import applyEatclean from "./rules/eatclean.js";
import applyVegetarian from "./rules/vegetarian.js";
import applyKeto from "./rules/keto.js";
import applyWeightGain from "./rules/weight_gain.js";
import applyWeightLoss from "./rules/weight_loss.js";

// ─────────────────────────────────────────────────────────
// Helper: Xây bảng điểm pantry có tính đến hạn sử dụng
// Sắp hết hạn sớm → ưu tiên nấu trước để tránh lãng phí
// ─────────────────────────────────────────────────────────
function buildPantryScoreMap(pantryItems) {
  const now = new Date();
  const map = new Map();
  pantryItems.forEach((p) => {
    const name = String(p.name).toLowerCase().trim();
    let score = 5; // Baseline: có trong tủ lạnh
    if (p.expiryDate) {
      const daysLeft = (new Date(p.expiryDate) - now) / (1000 * 60 * 60 * 24);
      if (daysLeft <= 3) score = 15;      // ⚠️ Nguy cấp: hết hạn trong 3 ngày
      else if (daysLeft <= 7) score = 10; // ⏳ Sắp hết: trong 7 ngày
    }
    if (!map.has(name) || map.get(name) < score) {
      map.set(name, score);
    }
  });
  return map;
}

// ─────────────────────────────────────────────────────────
// Helper: Sort candidates theo pantry score (expiry-aware)
// ─────────────────────────────────────────────────────────
function sortByPantryScore(candidates, pantryScoreMap, likedSet = null) {
  return candidates.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    (a.ingredients || []).forEach((i) => {
      const name = String(i?.name ?? i).toLowerCase().trim();
      if (likedSet && likedSet.has(name)) scoreA += 1;
      scoreA += pantryScoreMap.get(name) ?? 0;
    });
    (b.ingredients || []).forEach((i) => {
      const name = String(i?.name ?? i).toLowerCase().trim();
      if (likedSet && likedSet.has(name)) scoreB += 1;
      scoreB += pantryScoreMap.get(name) ?? 0;
    });
    return scoreB - scoreA;
  });
}

// ─────────────────────────────────────────────────────────
// Gợi ý thực đơn 1 ngày (1 sáng + 2 trưa + 2 tối)
// ─────────────────────────────────────────────────────────
export async function suggestDailyMenu(prefs, pantryItems = []) {
  const baseFilter = {};

  // Lọc dị ứng
  if (Array.isArray(prefs?.avoid_allergens) && prefs.avoid_allergens.length) {
    baseFilter.allergens = { $nin: prefs.avoid_allergens };
  }

  // Lọc ngân sách
  const budgetNum = Number(prefs?.budget_vnd);
  if (Number.isFinite(budgetNum) && budgetNum > 0) {
    const budgetPerMeal = Math.ceil(budgetNum / 5);
    if (budgetNum < 175000) {
      baseFilter["price_estimate.min"] = { $gte: 10000, $lte: 30000 };
      console.log(` Ngân sách THẤP: ${budgetNum} VNĐ/ngày (~${budgetPerMeal} VNĐ/món) → Món giá 10k-30k VNĐ`);
    } else if (budgetNum <= 350000) {
      baseFilter["price_estimate.min"] = { $gte: 30000, $lte: 40000 };
      console.log(` Ngân sách TRUNG BÌNH: ${budgetNum} VNĐ/ngày (~${budgetPerMeal} VNĐ/món) → Món giá 30k-40k VNĐ`);
    } else {
      baseFilter["price_estimate.min"] = { $gte: 40000, $lte: 50000 };
      console.log(` Ngân sách CAO: ${budgetNum} VNĐ/ngày (~${budgetPerMeal} VNĐ/món) → Món giá 40k-50k VNĐ`);
    }
  }

  if (prefs?.region) baseFilter.region = prefs.region;

  // ─── Bộ lọc Dinh dưỡng (Phase 1 - Strict Nutrition Filter) ───
  const minCal = Number(prefs?.min_calories);
  const maxCal = Number(prefs?.max_calories);
  const minPro = Number(prefs?.min_protein_g);
  const maxPro = Number(prefs?.max_protein_g);
  if (Number.isFinite(minCal) && minCal > 0) {
    baseFilter["nutrition.calories"] = { ...baseFilter["nutrition.calories"], $gte: minCal };
  }
  if (Number.isFinite(maxCal) && maxCal > 0) {
    baseFilter["nutrition.calories"] = { ...baseFilter["nutrition.calories"], $lte: maxCal };
  }
  if (Number.isFinite(minPro) && minPro > 0) {
    baseFilter["nutrition.protein_g"] = { ...baseFilter["nutrition.protein_g"], $gte: minPro };
  }
  if (Number.isFinite(maxPro) && maxPro > 0) {
    baseFilter["nutrition.protein_g"] = { ...baseFilter["nutrition.protein_g"], $lte: maxPro };
  }
  // ─────────────────────────────────────────────────────────────

  let candidates = await Recipe.find(baseFilter).lean();

  console.log(` Initial candidates: ${candidates.length}`);
  console.log(` Breakfast dishes: ${candidates.filter((r) => (r.meal_types || []).includes("breakfast")).length}`);
  console.log(` Lunch dishes: ${candidates.filter((r) => (r.meal_types || []).includes("lunch")).length}`);
  console.log(` Dinner dishes: ${candidates.filter((r) => (r.meal_types || []).includes("dinner")).length}`);

  // Lọc nguyên liệu tránh né
  if (Array.isArray(prefs?.avoid_ingredients) && prefs.avoid_ingredients.length) {
    const avoid = new Set(prefs.avoid_ingredients.map((s) => String(s).toLowerCase()));
    candidates = candidates.filter(
      (r) => !(r.ingredients || []).some((i) => avoid.has(String(i?.name ?? i).toLowerCase()))
    );
  }

  // Sắp xếp theo pantry score (expiry-aware)
  if (pantryItems && pantryItems.length > 0) {
    const pantryScoreMap = buildPantryScoreMap(pantryItems);
    const likedSet = Array.isArray(prefs?.liked_ingredients) && prefs.liked_ingredients.length
      ? new Set(prefs.liked_ingredients.map((s) => String(s).toLowerCase()))
      : null;
    candidates = sortByPantryScore(candidates, pantryScoreMap, likedSet);
  }

  // Áp dụng các rules chế độ ăn
  const steps = [
    (c) => applyKeto(c, prefs),
    (c) => applyVegetarian(c, prefs),
    (c) => applyDiet(c, prefs),
    (c) => applyHighProtein(c, prefs),
    (c) => applyWeightGain(c, prefs),
    (c) => applyWeightLoss(c, prefs),
    (c) => applyEatclean(c, prefs),
    (c) => applyTraditional(c, prefs),
  ];
  for (const s of steps) candidates = s(candidates, prefs);

  const breakfastCount = candidates.filter((r) => (r.meal_types || []).includes("breakfast")).length;
  const lunchCount = candidates.filter((r) => (r.meal_types || []).includes("lunch")).length;
  const dinnerCount = candidates.filter((r) => (r.meal_types || []).includes("dinner")).length;

  console.log(`After filters: ${candidates.length} total`);
  console.log(`  Breakfast: ${breakfastCount} món`);
  console.log(`  Lunch: ${lunchCount} món`);
  console.log(`  Dinner: ${dinnerCount} món`);

  if (breakfastCount < 1 || lunchCount < 2 || dinnerCount < 2) {
    console.warn(`Không đủ món! Cần nới lỏng điều kiện...`);
  }

  if (candidates.length === 0) {
    const relax = (list) => {
      let out = list;
      if (prefs?.diet_tags?.length) {
        const p2 = { ...prefs, diet_tags: [] };
        out = applyKeto(list, p2);
        out = applyVegetarian(out, p2);
        out = applyHighProtein(out, p2);
        out = applyEatclean(out, p2);
        out = applyTraditional(out, p2);
        if (out.length) return out;
      }
      if (prefs?.goal === "muscle_gain") {
        const minP = Number(prefs.min_protein_g) || 18;
        for (const step of [minP - 2, minP - 4]) {
          const p2 = { ...prefs, min_protein_g: step };
          let t = applyKeto(list, p2);
          t = applyVegetarian(t, p2);
          t = applyDiet(t, p2);
          t = applyHighProtein(t, p2);
          t = applyEatclean(t, p2);
          t = applyTraditional(t, p2);
          if (t.length) return t;
        }
      }
      if (prefs?.max_calories_per_meal) {
        const p2 = { ...prefs, max_calories_per_meal: prefs.max_calories_per_meal + 150 };
        let t = applyKeto(list, p2);
        t = applyVegetarian(t, p2);
        t = applyDiet(t, p2);
        t = applyHighProtein(t, p2);
        t = applyEatclean(t, p2);
        t = applyTraditional(t, p2);
        if (t.length) return t;
      }
      if (Number.isFinite(budgetNum) && budgetNum > 0) {
        return Recipe.find({ ...baseFilter, ["price_estimate.min"]: { $lte: budgetNum + 20000 } })
          .lean()
          .then((widerList) => {
            let t = widerList;
            t = applyKeto(t, prefs);
            t = applyVegetarian(t, prefs);
            t = applyDiet(t, prefs);
            t = applyHighProtein(t, prefs);
            t = applyEatclean(t, prefs);
            t = applyTraditional(t, prefs);
            return t;
          });
      }
    };
    candidates = await relax(await Recipe.find(baseFilter).lean());
  }

  const findDishByMealType = (mealType, excludeIds = []) => {
    const availableDishes = candidates.filter(
      (r) => !excludeIds.includes(r._id.toString()) && (r.meal_types || []).includes(mealType)
    );
    if (availableDishes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * Math.min(availableDishes.length, 5));
    return availableDishes[randomIndex];
  };

  const chosen = [];
  const usedIds = new Set();
  const targetCounts = { breakfast: 1, lunch: 2, dinner: 2 };

  for (const [mealType, count] of Object.entries(targetCounts)) {
    let added = 0;
    let attempts = 0;
    const maxAttempts = 20;
    console.log(`\nĐang chọn món ${mealType} (cần ${count} món)...`);
    while (added < count && attempts < maxAttempts) {
      const dish = findDishByMealType(mealType, Array.from(usedIds));
      if (!dish) {
        console.error(`Không tìm thấy thêm món ${mealType}! Hiện có ${added}/${count}`);
        break;
      }
      chosen.push(dish);
      usedIds.add(dish._id.toString());
      console.log(`  Thêm: ${dish.name_vi} (${dish.price_estimate?.min || "N/A"} VNĐ)`);
      added++;
      attempts++;
    }
  }

  const finalBreakfast = chosen.filter((m) => (m.meal_types || []).includes("breakfast")).length;
  const finalLunch = chosen.filter((m) => (m.meal_types || []).includes("lunch")).length;
  const finalDinner = chosen.filter((m) => (m.meal_types || []).includes("dinner")).length;

  console.log(`\nKẾT QUẢ CUỐI CÙNG:`);
  console.log(`  Sáng: ${finalBreakfast}/1 món`);
  console.log(`  Trưa: ${finalLunch}/2 món`);
  console.log(`  Tối: ${finalDinner}/2 món`);
  console.log(`  Tổng: ${chosen.length}/5 món\n`);

  return chosen;
}

// ─────────────────────────────────────────────────────────
// Gợi ý thực đơn 1 tuần (7 ngày × 5 món)
// ─────────────────────────────────────────────────────────
export async function suggestWeeklyMenu(prefs, pantryItems = []) {
  const baseFilter = {};

  if (Array.isArray(prefs?.avoid_allergens) && prefs.avoid_allergens.length) {
    baseFilter.allergens = { $nin: prefs.avoid_allergens };
  }

  const budgetNum = Number(prefs?.budget_vnd);
  if (Number.isFinite(budgetNum) && budgetNum > 0) {
    const budgetPerMeal = Math.ceil(budgetNum / 5);
    if (budgetNum < 175000) {
      baseFilter["price_estimate.min"] = { $gte: 10000, $lte: 30000 };
      console.log(` Ngân sách THẤP: ${budgetNum} VNĐ/ngày (~${budgetPerMeal} VNĐ/món) → Món giá 10k-30k VNĐ`);
    } else if (budgetNum <= 350000) {
      baseFilter["price_estimate.min"] = { $gte: 30000, $lte: 40000 };
      console.log(` Ngân sách TRUNG BÌNH: ${budgetNum} VNĐ/ngày (~${budgetPerMeal} VNĐ/món) → Món giá 30k-40k VNĐ`);
    } else {
      baseFilter["price_estimate.min"] = { $gte: 40000, $lte: 50000 };
      console.log(` Ngân sách CAO: ${budgetNum} VNĐ/ngày (~${budgetPerMeal} VNĐ/món) → Món giá 40k-50k VNĐ`);
    }
  }

  if (prefs?.region) baseFilter.region = prefs.region;

  // ─── Bộ lọc Dinh dưỡng (Phase 1) ───
  const minCal = Number(prefs?.min_calories);
  const maxCal = Number(prefs?.max_calories);
  const minPro = Number(prefs?.min_protein_g);
  const maxPro = Number(prefs?.max_protein_g);
  if (Number.isFinite(minCal) && minCal > 0) {
    baseFilter["nutrition.calories"] = { ...baseFilter["nutrition.calories"], $gte: minCal };
  }
  if (Number.isFinite(maxCal) && maxCal > 0) {
    baseFilter["nutrition.calories"] = { ...baseFilter["nutrition.calories"], $lte: maxCal };
  }
  if (Number.isFinite(minPro) && minPro > 0) {
    baseFilter["nutrition.protein_g"] = { ...baseFilter["nutrition.protein_g"], $gte: minPro };
  }
  if (Number.isFinite(maxPro) && maxPro > 0) {
    baseFilter["nutrition.protein_g"] = { ...baseFilter["nutrition.protein_g"], $lte: maxPro };
  }
  // ─────────────────────────────────────────────────────────────

  let candidates = await Recipe.find(baseFilter).lean();

  // Lọc nguyên liệu tránh né
  if (Array.isArray(prefs?.avoid_ingredients) && prefs.avoid_ingredients.length) {
    const avoid = new Set(prefs.avoid_ingredients.map((s) => String(s).toLowerCase()));
    candidates = candidates.filter(
      (r) => !(r.ingredients || []).some((i) => avoid.has(String(i?.name ?? i).toLowerCase()))
    );
  }

  // Sắp xếp theo pantry score (expiry-aware)
  if (pantryItems && pantryItems.length > 0) {
    const pantryScoreMap = buildPantryScoreMap(pantryItems);
    const likedSet = Array.isArray(prefs?.liked_ingredients) && prefs.liked_ingredients.length
      ? new Set(prefs.liked_ingredients.map((s) => String(s).toLowerCase()))
      : null;
    candidates = sortByPantryScore(candidates, pantryScoreMap, likedSet);
  }

  // Áp dụng các rules chế độ ăn
  const steps = [
    (c) => applyKeto(c, prefs),
    (c) => applyVegetarian(c, prefs),
    (c) => applyDiet(c, prefs),
    (c) => applyHighProtein(c, prefs),
    (c) => applyWeightGain(c, prefs),
    (c) => applyWeightLoss(c, prefs),
    (c) => applyEatclean(c, prefs),
    (c) => applyTraditional(c, prefs),
  ];
  for (const s of steps) candidates = s(candidates, prefs);

  if (candidates.length === 0) {
    const relax = (list) => {
      let out = list;
      if (prefs?.diet_tags?.length) {
        const p2 = { ...prefs, diet_tags: [] };
        out = applyKeto(list, p2);
        out = applyVegetarian(out, p2);
        out = applyHighProtein(out, p2);
        out = applyEatclean(out, p2);
        out = applyTraditional(out, p2);
        if (out.length) return out;
      }
      if (prefs?.goal === "muscle_gain") {
        const minP = Number(prefs.min_protein_g) || 18;
        for (const step of [minP - 2, minP - 4]) {
          const p2 = { ...prefs, min_protein_g: step };
          let t = applyKeto(list, p2);
          t = applyVegetarian(t, p2);
          t = applyDiet(t, p2);
          t = applyHighProtein(t, p2);
          t = applyEatclean(t, p2);
          t = applyTraditional(t, p2);
          if (t.length) return t;
        }
      }
      if (prefs?.max_calories_per_meal) {
        const p2 = { ...prefs, max_calories_per_meal: prefs.max_calories_per_meal + 150 };
        let t = applyKeto(list, p2);
        t = applyVegetarian(t, p2);
        t = applyDiet(t, p2);
        t = applyHighProtein(t, p2);
        t = applyEatclean(t, p2);
        t = applyTraditional(t, p2);
        if (t.length) return t;
      }
      if (Number.isFinite(budgetNum) && budgetNum > 0) {
        return Recipe.find({ ...baseFilter, ["price_estimate.min"]: { $lte: budgetNum + 20000 } })
          .lean()
          .then((widerList) => {
            let t = widerList;
            t = applyKeto(t, prefs);
            t = applyVegetarian(t, prefs);
            t = applyDiet(t, prefs);
            t = applyHighProtein(t, prefs);
            t = applyEatclean(t, prefs);
            t = applyTraditional(t, prefs);
            return t;
          });
      }
    };
    candidates = await relax(await Recipe.find(baseFilter).lean());
  }

  const findDishByMealType = (mealType, excludeIds = []) => {
    const availableDishes = candidates.filter(
      (r) => !excludeIds.includes(r._id.toString()) && (r.meal_types || []).includes(mealType)
    );
    if (availableDishes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * Math.min(availableDishes.length, 5));
    return availableDishes[randomIndex];
  };

  const weeklyMenu = [];
  const targetCounts = { breakfast: 1, lunch: 2, dinner: 2 };

  console.log(`\nBắt đầu tạo thực đơn 7 ngày...`);

  for (let day = 0; day < 7; day++) {
    const dayMeals = [];
    const usedInThisDay = new Set();
    console.log(`\n--- Ngày ${day + 1} ---`);

    for (const [mealType, count] of Object.entries(targetCounts)) {
      let added = 0;
      let attempts = 0;
      const maxAttempts = 50;
      while (added < count && attempts < maxAttempts) {
        const dish = findDishByMealType(mealType, Array.from(usedInThisDay));
        if (!dish) {
          console.warn(`Ngày ${day + 1}: Không tìm thấy thêm món ${mealType}! Hiện có ${added}/${count}`);
          break;
        }
        dayMeals.push(dish);
        usedInThisDay.add(dish._id.toString());
        console.log(`  ${mealType}: ${dish.name_vi}`);
        added++;
        attempts++;
      }
    }

    console.log(`  Tổng: ${dayMeals.length}/5 món`);

    weeklyMenu.push({
      day,
      dayName: ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][day],
      meals: dayMeals,
    });
  }

  console.log(`\nHoàn thành thực đơn tuần!\n`);
  return weeklyMenu;
}
