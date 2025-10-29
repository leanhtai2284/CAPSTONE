import NutritionFact from "../models/NutritionFact.js";
import Recipe from "../models/Recipe.js";
import { getPagination } from "../utils/pagination.js";

export async function listNutritionFacts(req, res) {
  try {
    const { limit, skip } = getPagination(req);
    const q = {};

    if (req.query.recipeId) q.recipeId = req.query.recipeId;
    if (req.query.min_calories) q.calories = { ...(q.calories || {}), $gte: Number(req.query.min_calories) };
    if (req.query.max_calories) q.calories = { ...(q.calories || {}), $lte: Number(req.query.max_calories) };
    if (req.query.min_protein_g) q.protein_g = { $gte: Number(req.query.min_protein_g) };
    if (req.query.max_protein_g) q.protein_g = { $lte: Number(req.query.max_protein_g) };

    const cursor = NutritionFact.find(q).skip(skip).limit(limit).sort({ createdAt: -1 });
    const [items, total] = await Promise.all([cursor.lean(), NutritionFact.countDocuments(q)]);

    res.json({ items, total, limit, page: Number(req.query.page || 1) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function getNutritionById(req, res) {
  try {
    const id = req.params.id;
    const doc = await NutritionFact.findById(id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function getNutritionByRecipeId(req, res) {
  try {
    const recipeId = req.params.recipeId;
    // Try to find nutrition by recipeId field first
    let doc = await NutritionFact.findOne({ recipeId }).lean();
    if (!doc) {
      // fallback: try find recipe object id
      const recipe = await Recipe.findOne({ $or: [{ _id: recipeId }, { id: recipeId }] }).lean();
      if (!recipe) return res.status(404).json({ error: "Recipe not found" });
      doc = await NutritionFact.findOne({ recipeRef: recipe._id }).lean();
      if (!doc) return res.status(404).json({ error: "Nutrition not found" });
    }
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
}
