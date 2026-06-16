import fs from "fs";
import path from "path";
import csv from "csv-parser";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const resolveDatasetPath = () => {
  const candidates = [
    path.resolve("backend/data/wikipedia_vn_dishes_filtered.csv"),
    path.resolve("data/wikipedia_vn_dishes_filtered.csv"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
};

const splitCompoundName = (name) => {
  const raw = String(name || "").trim();
  if (!raw) return [];
  const parts = raw
    .split(/\s+-\s+|\s*\/\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [raw];
};

const parseIngredientNames = (raw) => {
  if (!raw) return [];
  const items = String(raw)
    .split(/[,;]/)
    .map((item) => {
      const parts = item.split(":").map((s) => s.trim());
      const name = parts[0] || "";
      return name.trim();
    })
    .filter(Boolean)
    .flatMap(splitCompoundName)
    .map((name) =>
      normalizeText(
        name
          .replace(/\(.*?\)/g, " ")
          .replace(/\b(bam|xay|min|got|thai|cat|tuoi|kho|nhuyen)\b/g, " ")
          .trim(),
      ),
    )
    .filter(Boolean);

  return Array.from(new Set(items));
};

const tokenize = (value) => {
  const text = normalizeText(value);
  if (!text) return [];
  return text.split(/\s+/).filter(Boolean);
};

const jaccard = (aSet, bSet) => {
  if (!aSet.size && !bSet.size) return 0;
  let intersect = 0;
  for (const v of aSet) if (bSet.has(v)) intersect += 1;
  const union = aSet.size + bSet.size - intersect;
  return union > 0 ? intersect / union : 0;
};

let indexPromise = null;

const buildIndex = async () => {
  const filePath = resolveDatasetPath();
  if (!fs.existsSync(filePath)) return [];

  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => String(header || "").trim() }))
      .on("data", (row) => rows.push(row))
      .on("error", reject)
      .on("end", resolve);
  });

  return rows
    .map((row) => {
      const name = row.name_vi || row.name || "";
      const ingredientNames = parseIngredientNames(row.ingredients || "");
      const nameTokens = tokenize(name);
      const nutrition = {
        calories: Number(row.calories || 0),
        protein_g: Number(row.protein_g || 0),
        carbs_g: Number(row.carbs_g || 0),
        fat_g: Number(row.fat_g || 0),
        fiber_g: Number(row.fiber_g || 0),
        sodium_mg: Number(row.sodium_mg || 0),
        sugar_g: Number(row.sugar_g || 0),
      };
      const price = {
        min: Number(row.price_est_vnd_min || 0),
        max: Number(row.price_est_vnd_max || 0),
        currency: "VND",
      };

      return {
        id: row.id || "",
        name,
        ingredientNames,
        nameTokens,
        nutrition,
        price_estimate: price,
      };
    })
    .filter((row) => row.name && row.ingredientNames.length);
};

export async function getDishIndex() {
  if (!indexPromise) indexPromise = buildIndex();
  return indexPromise;
}

export async function retrieveNutritionFromDataset({
  name,
  ingredients,
  topK = 3,
  minScore = 0.25,
}) {
  const index = await getDishIndex();
  if (!index.length) return null;

  const inputIngredients = new Set(
    (ingredients || [])
      .map((item) => normalizeText(item?.name || item))
      .filter(Boolean),
  );
  const inputNameTokens = new Set(tokenize(name));

  const scored = index
    .map((dish) => {
      const dishIngredients = new Set(dish.ingredientNames);
      const dishNameTokens = new Set(dish.nameTokens);
      const ingScore = jaccard(inputIngredients, dishIngredients);
      const nameScore = jaccard(inputNameTokens, dishNameTokens);
      const score = ingScore * 0.7 + nameScore * 0.3;
      return { dish, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (!scored.length || scored[0].score < minScore) return null;

  const avg = (key) =>
    Math.round(
      scored.reduce((sum, row) => sum + (row.dish.nutrition[key] || 0), 0) /
        scored.length,
    );

  const avgFloat = (key) =>
    Math.round(
      (scored.reduce((sum, row) => sum + (row.dish.nutrition[key] || 0), 0) /
        scored.length) *
        10,
    ) / 10;

  const nutrition = {
    calories: avg("calories"),
    protein_g: avgFloat("protein_g"),
    carbs_g: avgFloat("carbs_g"),
    fat_g: avgFloat("fat_g"),
    fiber_g: avgFloat("fiber_g"),
    sodium_mg: avg("sodium_mg"),
    sugar_g: avgFloat("sugar_g"),
  };

  const priceMin = Math.round(
    scored.reduce((sum, row) => sum + (row.dish.price_estimate.min || 0), 0) /
      scored.length,
  );
  const priceMax = Math.round(
    scored.reduce((sum, row) => sum + (row.dish.price_estimate.max || 0), 0) /
      scored.length,
  );

  return {
    nutrition,
    price_estimate: { min: priceMin, max: priceMax, currency: "VND" },
    score: scored[0].score,
    matches: scored.map((row) => ({
      id: row.dish.id,
      name: row.dish.name,
      score: row.score,
    })),
  };
}
