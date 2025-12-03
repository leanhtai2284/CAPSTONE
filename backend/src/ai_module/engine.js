import Recipe from "../models/Recipe.js";
import applyDiet from "./rules/diet.js";
import applyTraditional from "./rules/traditional.js";
import applyHighProtein from "./rules/high_protein.js";
import applyEatclean from "./rules/eatclean.js";
import applyVegetarian from "./rules/vegetarian.js";
import applyKeto from "./rules/keto.js";

// ...existing code...

export async function suggestDailyMenu(prefs) {
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

  // Hàm helper để tìm món theo meal_type và category
  const findDish = (mealType, category, excludeIds = []) => {
    return candidates.find(
      (r) =>
        !excludeIds.includes(r._id.toString()) &&
        (r.meal_types || []).includes(mealType) &&
        (r.category || "").toLowerCase() === category.toLowerCase()
    );
  };

  const chosen = [];
  const usedIds = new Set();

  // SÁNG: 1 món main
  const breakfast = findDish("breakfast", "main");
  if (breakfast) {
    chosen.push(breakfast);
    usedIds.add(breakfast._id.toString());
  }

  // TRƯA: 1 main + 1 (soup/snack/dessert)
  const lunchMain = findDish("lunch", "main", Array.from(usedIds));
  if (lunchMain) {
    chosen.push(lunchMain);
    usedIds.add(lunchMain._id.toString());
  }

  const lunchExtra =
    findDish("lunch", "soup", Array.from(usedIds)) ||
    findDish("lunch", "snack", Array.from(usedIds)) ||
    findDish("lunch", "dessert", Array.from(usedIds));
  if (lunchExtra) {
    chosen.push(lunchExtra);
    usedIds.add(lunchExtra._id.toString());
  }

  // TỐI: 1 main + 1 (soup/snack/dessert)
  const dinnerMain = findDish("dinner", "main", Array.from(usedIds));
  if (dinnerMain) {
    chosen.push(dinnerMain);
    usedIds.add(dinnerMain._id.toString());
  }

  const dinnerExtra =
    findDish("dinner", "soup", Array.from(usedIds)) ||
    findDish("dinner", "snack", Array.from(usedIds)) ||
    findDish("dinner", "dessert", Array.from(usedIds));
  if (dinnerExtra) {
    chosen.push(dinnerExtra);
    usedIds.add(dinnerExtra._id.toString());
  }

  // Fallback nếu thiếu món
  const requiredCount = 5; // 1 sáng + 2 trưa + 2 tối
  while (chosen.length < requiredCount) {
    const fallback = candidates.find((r) => !usedIds.has(r._id.toString()));
    if (!fallback) break;
    chosen.push(fallback);
    usedIds.add(fallback._id.toString());
  }

  return chosen;
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

  // Hàm helper để tìm món theo meal_type và category
  const findDish = (mealType, category, excludeIds = []) => {
    return candidates.find(
      (r) =>
        !excludeIds.includes(r._id.toString()) &&
        (r.meal_types || []).includes(mealType) &&
        (r.category || "").toLowerCase() === category.toLowerCase()
    );
  };

  const weeklyMenu = [];
  const usedRecipeIds = new Set();

  for (let day = 0; day < 7; day++) {
    const dayMeals = [];

    // SÁNG: 1 món main
    const breakfast = findDish("breakfast", "main", Array.from(usedRecipeIds));
    if (breakfast) {
      dayMeals.push(breakfast);
      usedRecipeIds.add(breakfast._id.toString());
    }

    // TRƯA: 1 main + 1 (soup/snack/dessert)
    const lunchMain = findDish("lunch", "main", Array.from(usedRecipeIds));
    if (lunchMain) {
      dayMeals.push(lunchMain);
      usedRecipeIds.add(lunchMain._id.toString());
    }

    const lunchExtra =
      findDish("lunch", "soup", Array.from(usedRecipeIds)) ||
      findDish("lunch", "snack", Array.from(usedRecipeIds)) ||
      findDish("lunch", "dessert", Array.from(usedRecipeIds));
    if (lunchExtra) {
      dayMeals.push(lunchExtra);
      usedRecipeIds.add(lunchExtra._id.toString());
    }

    // TỐI: 1 main + 1 (soup/snack/dessert)
    const dinnerMain = findDish("dinner", "main", Array.from(usedRecipeIds));
    if (dinnerMain) {
      dayMeals.push(dinnerMain);
      usedRecipeIds.add(dinnerMain._id.toString());
    }

    const dinnerExtra =
      findDish("dinner", "soup", Array.from(usedRecipeIds)) ||
      findDish("dinner", "snack", Array.from(usedRecipeIds)) ||
      findDish("dinner", "dessert", Array.from(usedRecipeIds));
    if (dinnerExtra) {
      dayMeals.push(dinnerExtra);
      usedRecipeIds.add(dinnerExtra._id.toString());
    }

    // Fallback nếu thiếu món
    while (dayMeals.length < 5) {
      const fallback = candidates.find(
        (r) => !usedRecipeIds.has(r._id.toString())
      );
      if (!fallback) break;
      dayMeals.push(fallback);
      usedRecipeIds.add(fallback._id.toString());
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
