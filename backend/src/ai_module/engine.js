import Recipe from "../models/Recipe.js";
import applyDiet from "./rules/diet.js";
import applyTraditional from "./rules/traditional.js";
import applyHighProtein from "./rules/high_protein.js";
import applyEatclean from "./rules/eatclean.js";
import applyVegetarian from "./rules/vegetarian.js";

export async function suggestDailyMenu(prefs) {
  const baseFilter = {};
  if (prefs?.avoid_allergens?.length)
    baseFilter.allergens = { $nin: prefs.avoid_allergens };
  if (prefs?.budget_vnd)
    baseFilter["price_estimate.min"] = { $lte: prefs.budget_vnd };
  if (prefs?.region) baseFilter.region = prefs.region;

  let candidates = await Recipe.find(baseFilter).lean();

  if (prefs?.avoid_ingredients?.length) {
    const avoid = new Set(prefs.avoid_ingredients.map((s) => s.toLowerCase()));
    candidates = candidates.filter(
      (r) =>
        !(r.ingredients || []).some((i) => avoid.has(String(i).toLowerCase()))
    );
  }
  if (prefs?.liked_ingredients?.length) {
    const like = new Set(prefs.liked_ingredients.map((s) => s.toLowerCase()));
    candidates = candidates.sort((a, b) => {
      const ac = (a.ingredients || []).some((i) =>
        like.has(String(i).toLowerCase())
      );
      const bc = (b.ingredients || []).some((i) =>
        like.has(String(i).toLowerCase())
      );
      return bc - ac;
    });
  }

  const steps = [
    (c) => applyDiet(c, prefs),
    (c) => applyVegetarian(c, prefs),
    (c) => applyHighProtein(c, prefs),
    (c) => applyEatclean(c, prefs),
    (c) => applyTraditional(c, prefs),
  ];
  for (const s of steps) candidates = s(candidates, prefs);

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
