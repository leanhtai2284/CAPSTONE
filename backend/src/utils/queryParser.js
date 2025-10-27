export function buildRecipeQuery(q = {}) {
  const {
    text,
    region,
    category,
    meal_types,
    diet_tags,
    allergens_exclude,
    max_calories,
    min_protein,
    max_price,
    spice_level_max,
    time_max,
  } = q;

  const filter = {};

  if (text) filter.$text = { $search: text };
  if (region) filter.region = region;
  if (category) filter.category = category;

  if (meal_types)
    filter.meal_types = {
      $all: String(meal_types)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
  if (diet_tags)
    filter.diet_tags = {
      $all: String(diet_tags)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
  if (allergens_exclude)
    filter.allergens = {
      $nin: String(allergens_exclude)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
  if (max_calories)
    filter["nutrition.calories"] = { $lte: Number(max_calories) };
  if (min_protein)
    filter["nutrition.protein_g"] = { $gte: Number(min_protein) };
  if (max_price) filter["price_estimate.min"] = { $lte: Number(max_price) };
  if (typeof spice_level_max !== "undefined")
    filter.spice_level = { $lte: Number(spice_level_max) };

  if (time_max) {
    filter.$expr = {
      $lte: [{ $add: ["$prep_time_min", "$cook_time_min"] }, Number(time_max)],
    };
  }
  return filter;
}
