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
    ingredients,
    ingredient,
    ingredients_mode,
    ingredientsMode,
  } = q;

  const filter = {};

  const toAccentRegex = (textVal) => {
    const map = {
      a: "[aàáạảãâầấậẩẫăằắặẳẵ]",
      e: "[eèéẹẻẽêềếệểễ]",
      i: "[iìíịỉĩ]",
      o: "[oòóọỏõôồốộổỗơờớợởỡ]",
      u: "[uùúụủũưừứựửữ]",
      y: "[yỳýỵỷỹ]",
      d: "[dđ]",
    };
    return String(textVal || "")
      .trim()
      .toLowerCase()
      .replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
      .replace(/[aeiouyd]/g, (ch) => map[ch] || ch);
  };

  const wordToOrClause = (word) => ({
    $or: [
      { name_vi: { $regex: toAccentRegex(word), $options: "i" } },
      { name: { $regex: toAccentRegex(word), $options: "i" } },
      { title: { $regex: toAccentRegex(word), $options: "i" } },
    ],
  });

  // Match all words in name/title (accent-insensitive)
  if (text && text.trim()) {
    const words = String(text).trim().split(/\s+/).filter(Boolean);

    const textClauses = [
      wordToOrClause(words.join(" ")),
      ...words.map(wordToOrClause),
    ];

    filter.$and = [...(filter.$and || []), ...textClauses];
  }
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

  const ingredientSource = ingredients ?? ingredient;
  if (ingredientSource) {
    const ingredientList = String(ingredientSource)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (ingredientList.length) {
      const ingredientClauses = ingredientList.map((name) => ({
        ingredients: {
          $elemMatch: {
            name: { $regex: toAccentRegex(name), $options: "i" },
          },
        },
      }));
      const mode = String(ingredients_mode ?? ingredientsMode ?? "all")
        .toLowerCase()
        .trim();

      if (mode === "any") {
        filter.$and = [...(filter.$and || []), { $or: ingredientClauses }];
      } else {
        filter.$and = [...(filter.$and || []), ...ingredientClauses];
      }
    }
  }
  return filter;
}
