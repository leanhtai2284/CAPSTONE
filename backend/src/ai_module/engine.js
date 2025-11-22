import Recipe from "../models/Recipe.js";
import applyDiet from "./rules/diet.js";
import applyTraditional from "./rules/traditional.js";
import applyHighProtein from "./rules/high_protein.js";
import applyEatclean from "./rules/eatclean.js";
import applyVegetarian from "./rules/vegetarian.js";
import applyKeto from "./rules/keto.js";

export async function suggestDailyMenu(prefs) {
  const baseFilter = {};

  if (Array.isArray(prefs?.avoid_allergens) && prefs.avoid_allergens.length) {
    baseFilter.allergens = { $nin: prefs.avoid_allergens };
  }

  // ✅ Ép kiểu số cho budget; chỉ áp filter khi là số hợp lệ
  const budgetNum = Number(prefs?.budget_vnd);
  if (Number.isFinite(budgetNum) && budgetNum > 0) {
    baseFilter["price_estimate.min"] = { $lte: budgetNum };
  }

  if (prefs?.region) baseFilter.region = prefs.region;

  let candidates = await Recipe.find(baseFilter).lean();

  // ✅ So khớp ingredients theo .name (không dùng String(i))
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

  // ✅ Thứ tự rule: KETO → VEGETARIAN → DIET-TAGS → HIGH-PROTEIN → EATCLEAN → TRADITIONAL
  const steps = [
    (c) => applyKeto(c, prefs), // ← BỔ SUNG bước keto (fallback theo carbs nếu chưa gắn tag)
    (c) => applyVegetarian(c, prefs),
    (c) => applyDiet(c, prefs), // ← “diet tags generic”: yêu cầu đủ tag
    (c) => applyHighProtein(c, prefs),
    (c) => applyEatclean(c, prefs),
    (c) => applyTraditional(c, prefs),
  ];
  for (const s of steps) candidates = s(candidates, prefs);

  // ✅ Fallback: nếu rỗng, tự động “nới”
  if (candidates.length === 0) {
    const relax = (list) => {
      let out = list;

      // 1) bỏ diet_tags khắt khe
      if (prefs?.diet_tags?.length) {
        const p2 = { ...prefs, diet_tags: [] };
        out = applyKeto(list, p2);
        out = applyVegetarian(out, p2);
        out = applyHighProtein(out, p2);
        out = applyEatclean(out, p2);
        out = applyTraditional(out, p2);
        if (out.length) return out;
      }

      // 2) nới protein
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

      // 3) nới calories (eatclean)
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

      // 4) nới budget +20k nếu có budget
      if (Number.isFinite(budgetNum) && budgetNum > 0) {
        return Recipe.find({
          ...baseFilter,
          ["price_estimate.min"]: { $lte: budgetNum + 20000 },
        }).lean();
      }
      return [];
    };

    candidates = await relax(await Recipe.find(baseFilter).lean());
  }

  // Chọn 3 bữa như cũ
  const pickFor = (meal) =>
    candidates.find((r) => (r.meal_types || []).includes(meal));
  const breakfast = pickFor("breakfast");
  const lunch = candidates.find(
    (r) => r !== breakfast && (r.meal_types || []).includes("lunch")
  );
  const dinner = candidates.find(
    (r) =>
      r !== breakfast && r !== lunch && (r.meal_types || []).includes("dinner")
  );

  const chosen = [breakfast, lunch, dinner].filter(Boolean);
  for (const meal of ["breakfast", "lunch", "dinner"]) {
    if (!chosen.find((r) => (r.meal_types || []).includes(meal))) {
      const c = candidates.find((r) => !chosen.includes(r));
      if (c) chosen.push(c);
    }
  }
  return chosen.slice(0, 3);
}

//ham tao goi y thuc don cho 1 tuan
export async function suggestWeeklyMenu(prefs) {
  const baseFilter = {};

  if (Array.isArray(prefs?.avoid_allergens) && prefs.avoid_allergens.length) {
    baseFilter.allergens = { $nin: prefs.avoid_allergens };
  }

  const budgetNum = Number(prefs?.budget_vnd);
  if (Number.isFinite(budgetNum) && budgetNum > 0) {
    baseFilter["price_estimate.min"] = { $lte: budgetNum };
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
        }).lean();
      }
      return [];
    };
    candidates = await relax(await Recipe.find(baseFilter).lean());
  }

  //  Tạo thực đơn 7 ngày - không trùng lặp
  const weeklyMenu = [];
  const usedRecipeIds = new Set();

  for (let day = 0; day < 7; day++) {
    const dayMeals = [];
    const mealTypes = ["breakfast", "lunch", "dinner"];

    for (const mealType of mealTypes) {
      // Tìm công thức chưa dùng cho meal type này
      const meal = candidates.find(
        (r) =>
          !usedRecipeIds.has(r._id.toString()) &&
          (r.meal_types || []).includes(mealType)
      );

      if (meal) {
        dayMeals.push(meal);
        usedRecipeIds.add(meal._id.toString());
      } else {
        // Fallback: lấy bất kỳ công thức chưa dùng
        const fallback = candidates.find(
          (r) => !usedRecipeIds.has(r._id.toString())
        );
        if (fallback) {
          dayMeals.push(fallback);
          usedRecipeIds.add(fallback._id.toString());
        }
      }
    }

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

  return weeklyMenu;
}
