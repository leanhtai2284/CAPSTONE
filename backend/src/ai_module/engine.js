import Recipe from "../models/Recipe.js";
import applyDiet from "./rules/diet.js";
import applyTraditional from "./rules/traditional.js";
import applyHighProtein from "./rules/high_protein.js";
import applyEatclean from "./rules/eatclean.js";
import applyVegetarian from "./rules/vegetarian.js";
import applyKeto from "./rules/keto.js";
import applyWeightGain from "./rules/weight_gain.js";
import applyWeightLoss from "./rules/weight_loss.js";

// ...existing code...

export async function suggestDailyMenu(prefs) {
  const baseFilter = {};

  if (Array.isArray(prefs?.avoid_allergens) && prefs.avoid_allergens.length) {
    baseFilter.allergens = { $nin: prefs.avoid_allergens };
  }

  // Budget cho cả ngày, chia đều cho 5 món (1 sáng + 2 trưa + 2 tối)
  const budgetNum = Number(prefs?.budget_vnd);
  if (Number.isFinite(budgetNum) && budgetNum > 0) {
    const budgetPerMeal = Math.ceil(budgetNum / 5); // Chia đều cho 5 món
    baseFilter["price_estimate.min"] = { $lte: budgetPerMeal };
    console.log(`💰 Budget: ${budgetNum} VNĐ/ngày → ~${budgetPerMeal} VNĐ/món`);
  }

  if (prefs?.region) baseFilter.region = prefs.region;

  let candidates = await Recipe.find(baseFilter).lean();

  console.log(` Initial candidates: ${candidates.length}`);
  console.log(
    ` Breakfast dishes: ${
      candidates.filter((r) => (r.meal_types || []).includes("breakfast"))
        .length
    }`
  );
  console.log(
    ` Lunch dishes: ${
      candidates.filter((r) => (r.meal_types || []).includes("lunch")).length
    }`
  );
  console.log(
    ` Dinner dishes: ${
      candidates.filter((r) => (r.meal_types || []).includes("dinner")).length
    }`
  );

  if (
    Array.isArray(prefs?.avoid_ingredients) &&
    prefs.avoid_ingredients.length
  ) {
    const avoid = new Set(
      prefs.avoid_ingredients.map((s) => String(s).toLowerCase())
    );
    candidates = candidates.filter(
      (r) =>
        !(r.ingredients || []).some((i) =>
          avoid.has(String(i?.name ?? i).toLowerCase())
        )
    );
  }

  if (
    Array.isArray(prefs?.liked_ingredients) &&
    prefs.liked_ingredients.length
  ) {
    const like = new Set(
      prefs.liked_ingredients.map((s) => String(s).toLowerCase())
    );
    candidates = candidates.sort((a, b) => {
      const ac = (a.ingredients || []).some((i) =>
        like.has(String(i?.name ?? i).toLowerCase())
      );
      const bc = (b.ingredients || []).some((i) =>
        like.has(String(i?.name ?? i).toLowerCase())
      );
      return Number(bc) - Number(ac);
    });
  }

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

  const breakfastCount = candidates.filter((r) =>
    (r.meal_types || []).includes("breakfast")
  ).length;
  const lunchCount = candidates.filter((r) =>
    (r.meal_types || []).includes("lunch")
  ).length;
  const dinnerCount = candidates.filter((r) =>
    (r.meal_types || []).includes("dinner")
  ).length;

  console.log(`📊 After filters: ${candidates.length} total`);
  console.log(`  🌅 Breakfast: ${breakfastCount} món`);
  console.log(`  🌞 Lunch: ${lunchCount} món`);
  console.log(`  🌙 Dinner: ${dinnerCount} món`);

  // Kiểm tra xem có đủ món không (cần ít nhất: 1 breakfast, 2 lunch, 2 dinner)
  if (breakfastCount < 1 || lunchCount < 2 || dinnerCount < 2) {
    console.warn(`⚠️ Không đủ món! Cần nới lỏng điều kiện...`);
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
        const p2 = {
          ...prefs,
          max_calories_per_meal: prefs.max_calories_per_meal + 150,
        };
        let t = applyKeto(list, p2);
        t = applyVegetarian(t, p2);
        t = applyDiet(t, p2);
        t = applyHighProtein(t, p2);
        t = applyEatclean(t, p2);
        t = applyTraditional(t, p2);
        if (t.length) return t;
      }

      if (Number.isFinite(budgetNum) && budgetNum > 0) {
        return Recipe.find({
          ...baseFilter,
          ["price_estimate.min"]: { $lte: budgetNum + 20000 },
        })
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

  // Hàm helper để tìm món theo meal_type với random để đa dạng hơn
  const findDishByMealType = (mealType, excludeIds = []) => {
    const availableDishes = candidates.filter(
      (r) =>
        !excludeIds.includes(r._id.toString()) &&
        (r.meal_types || []).includes(mealType)
    );

    if (availableDishes.length === 0) return null;

    // Random để đa dạng hơn thay vì luôn chọn món đầu tiên
    const randomIndex = Math.floor(
      Math.random() * Math.min(availableDishes.length, 5)
    );
    return availableDishes[randomIndex];
  };

  const chosen = [];
  const usedIds = new Set();

  // Ràng buộc số lượng món cho mỗi bữa
  const targetCounts = {
    breakfast: 1,
    lunch: 2,
    dinner: 2,
  };

  // Chọn món cho từng bữa theo số lượng yêu cầu
  for (const [mealType, count] of Object.entries(targetCounts)) {
    let added = 0;
    let attempts = 0;
    const maxAttempts = 20; // Tránh vòng lặp vô hạn

    console.log(`\n🍽️  Đang chọn món ${mealType} (cần ${count} món)...`);

    while (added < count && attempts < maxAttempts) {
      const dish = findDishByMealType(mealType, Array.from(usedIds));

      if (!dish) {
        console.error(
          `⚠️ Không tìm thấy thêm món ${mealType}! Hiện có ${added}/${count}`
        );
        break;
      }

      chosen.push(dish);
      usedIds.add(dish._id.toString());
      console.log(
        `  ✅ Thêm: ${dish.name_vi} (${dish.price_estimate?.min || "N/A"} VNĐ)`
      );
      added++;
      attempts++;
    }
  }

  const finalBreakfast = chosen.filter((m) =>
    (m.meal_types || []).includes("breakfast")
  ).length;
  const finalLunch = chosen.filter((m) =>
    (m.meal_types || []).includes("lunch")
  ).length;
  const finalDinner = chosen.filter((m) =>
    (m.meal_types || []).includes("dinner")
  ).length;

  console.log(`\n✅ KẾT QUẢ CUỐI CÙNG:`);
  console.log(`  🌅 Sáng: ${finalBreakfast}/1 món`);
  console.log(`  🌞 Trưa: ${finalLunch}/2 món`);
  console.log(`  🌙 Tối: ${finalDinner}/2 món`);
  console.log(`  📦 Tổng: ${chosen.length}/5 món\n`);

  return chosen;
}

//ham tao goi y thuc don cho 1 tuan
export async function suggestWeeklyMenu(prefs) {
  const baseFilter = {};

  if (Array.isArray(prefs?.avoid_allergens) && prefs.avoid_allergens.length) {
    baseFilter.allergens = { $nin: prefs.avoid_allergens };
  }

  // Budget cho cả ngày, chia đều cho 5 món (1 sáng + 2 trưa + 2 tối)
  const budgetNum = Number(prefs?.budget_vnd);
  if (Number.isFinite(budgetNum) && budgetNum > 0) {
    const budgetPerMeal = Math.ceil(budgetNum / 5); // Chia đều cho 5 món
    baseFilter["price_estimate.min"] = { $lte: budgetPerMeal };
    console.log(`💰 Budget: ${budgetNum} VNĐ/ngày → ~${budgetPerMeal} VNĐ/món`);
  }

  if (prefs?.region) baseFilter.region = prefs.region;

  let candidates = await Recipe.find(baseFilter).lean();

  if (
    Array.isArray(prefs?.avoid_ingredients) &&
    prefs.avoid_ingredients.length
  ) {
    const avoid = new Set(
      prefs.avoid_ingredients.map((s) => String(s).toLowerCase())
    );
    candidates = candidates.filter(
      (r) =>
        !(r.ingredients || []).some((i) =>
          avoid.has(String(i?.name ?? i).toLowerCase())
        )
    );
  }

  if (
    Array.isArray(prefs?.liked_ingredients) &&
    prefs.liked_ingredients.length
  ) {
    const like = new Set(
      prefs.liked_ingredients.map((s) => String(s).toLowerCase())
    );
    candidates = candidates.sort((a, b) => {
      const ac = (a.ingredients || []).some((i) =>
        like.has(String(i?.name ?? i).toLowerCase())
      );
      const bc = (b.ingredients || []).some((i) =>
        like.has(String(i?.name ?? i).toLowerCase())
      );
      return Number(bc) - Number(ac);
    });
  }

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
        const p2 = {
          ...prefs,
          max_calories_per_meal: prefs.max_calories_per_meal + 150,
        };
        let t = applyKeto(list, p2);
        t = applyVegetarian(t, p2);
        t = applyDiet(t, p2);
        t = applyHighProtein(t, p2);
        t = applyEatclean(t, p2);
        t = applyTraditional(t, p2);
        if (t.length) return t;
      }
      if (Number.isFinite(budgetNum) && budgetNum > 0) {
        return Recipe.find({
          ...baseFilter,
          ["price_estimate.min"]: { $lte: budgetNum + 20000 },
        })
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

  // Hàm helper để tìm món theo meal_type với random để đa dạng hơn
  const findDishByMealType = (mealType, excludeIds = []) => {
    const availableDishes = candidates.filter(
      (r) =>
        !excludeIds.includes(r._id.toString()) &&
        (r.meal_types || []).includes(mealType)
    );

    if (availableDishes.length === 0) return null;

    // Random để đa dạng hơn thay vì luôn chọn món đầu tiên
    const randomIndex = Math.floor(
      Math.random() * Math.min(availableDishes.length, 5)
    );
    return availableDishes[randomIndex];
  };

  const weeklyMenu = [];
  // KHÔNG dùng usedRecipeIds global nữa - món có thể lặp giữa các ngày

  // Ràng buộc số lượng món cho mỗi bữa
  const targetCounts = {
    breakfast: 1,
    lunch: 2,
    dinner: 2,
  };

  console.log(`\n📅 Bắt đầu tạo thực đơn 7 ngày...`);

  for (let day = 0; day < 7; day++) {
    const dayMeals = [];
    const usedInThisDay = new Set(); // Track món đã dùng TRONG NGÀY này

    console.log(`\n--- Ngày ${day + 1} ---`);

    // Chọn món cho từng bữa theo số lượng yêu cầu
    for (const [mealType, count] of Object.entries(targetCounts)) {
      let added = 0;
      let attempts = 0;
      const maxAttempts = 50; // Tăng số attempts

      while (added < count && attempts < maxAttempts) {
        const dish = findDishByMealType(mealType, Array.from(usedInThisDay));

        if (!dish) {
          console.warn(
            `⚠️ Ngày ${
              day + 1
            }: Không tìm thấy thêm món ${mealType}! Hiện có ${added}/${count}`
          );
          break;
        }

        dayMeals.push(dish);
        usedInThisDay.add(dish._id.toString()); // Chỉ track trong ngày
        console.log(`  ✅ ${mealType}: ${dish.name_vi}`);
        added++;
        attempts++;
      }
    }

    console.log(`  📦 Tổng: ${dayMeals.length}/5 món`);

    weeklyMenu.push({
      day,
      dayName: [
        "Chủ nhật",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
      ][day],
      meals: dayMeals,
    });
  }

  console.log(`\n✅ Hoàn thành thực đơn tuần!\n`);

  return weeklyMenu;
}
