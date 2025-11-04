//Recipescontroler
import Recipe from "../models/Recipe.js";
import { buildRecipeQuery } from "../utils/queryParser.js";
import { getPagination } from "../utils/pagination.js";
import { suggestDailyMenu } from "../ai_module/engine.js";
import mongoose from "mongoose";

export async function searchRecipes(req, res) {
  try {
    // 1️⃣ Xây filter dựa trên query (nếu có)
    const filter = buildRecipeQuery(req.query);

    // 2️⃣ Lấy toàn bộ dữ liệu, sắp xếp theo món mới nhất
    const items = await Recipe.find(filter).sort({ createdAt: -1 }).lean();

    // 3️⃣ Trả kết quả ra API
    res.json({
      items,
      total: items.length,
    });
  } catch (e) {
    console.error("❌ Lỗi khi lấy danh sách công thức:", e);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function getRecipeById(req, res) {
  const idOrSlug = String(req.params.id || "").trim();

  try {
    // 1) Luôn ưu tiên tìm theo slug/id (field "id" của mình)
    let recipe = await Recipe.findOne({ id: idOrSlug }).lean();

    // 2) Nếu chưa thấy và tham số trông như ObjectId thì mới thử theo _id
    if (!recipe && mongoose.isValidObjectId(idOrSlug)) {
      recipe = await Recipe.findById(idOrSlug).lean();
    }

    if (!recipe) {
      return res.status(404).json({ error: "Not found" });
    }

    // ---------- scale nguyên liệu theo ?servings= ----------
    const reqServings = Number(req.query.servings);
    const baseServings = Number(recipe.servings || 1);
    const targetServings =
      Number.isFinite(reqServings) && reqServings > 0
        ? reqServings
        : baseServings;

    const factor = baseServings > 0 ? targetServings / baseServings : 1;
    const round1 = (v) => Math.round((v + Number.EPSILON) * 10) / 10;

    let scaledIngredients = recipe.ingredients;

    if (Array.isArray(recipe.ingredients) && recipe.ingredients.length) {
      const looksStructured =
        typeof recipe.ingredients[0] === "object" &&
        recipe.ingredients[0] !== null;

      if (looksStructured) {
        scaledIngredients = recipe.ingredients.map((ing) => {
          if (typeof ing.amount !== "number") return ing; // không có amount thì giữ nguyên
          const isScalable =
            typeof ing.scalable === "boolean" ? ing.scalable : true; // default: true
          return {
            ...ing,
            amount: isScalable ? round1(ing.amount * factor) : ing.amount,
          };
        });
      }
    }

    return res.json({
      ...recipe,
      ingredients: scaledIngredients,
      currentServings: targetServings,
      baseServings,
      scaleFactor: factor,
    });
  } catch (e) {
    // Bắt riêng CastError (nếu lỡ đâu vẫn xảy ra) để không trả 500 mù mờ
    if (e?.name === "CastError" && e?.path === "_id") {
      console.warn(
        "[getRecipeById] CastError _id, fallback to slug only:",
        idOrSlug
      );
      try {
        const recipe = await Recipe.findOne({ id: idOrSlug }).lean();
        if (!recipe) return res.status(404).json({ error: "Not found" });
        return res.json(recipe);
      } catch (e2) {
        console.error("[getRecipeById][fallback] ", e2);
        return res.status(500).json({ error: "Internal error" });
      }
    }
    console.error("[getRecipeById] ", e);
    return res.status(500).json({ error: "Internal error" });
  }
}

export async function suggestMenu(req, res) {
  try {
    const prefs = req.body || {};
    const items = await suggestDailyMenu(prefs);
    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function similarRecipes(req, res) {
  try {
    const idOrSlug = req.params.id;
    const cur = await Recipe.findOne({
      $or: [{ _id: idOrSlug }, { id: idOrSlug }],
    }).lean();
    if (!cur) return res.status(404).json({ error: "Not found" });

    const q = {
      region: cur.region,
      category: cur.category,
      diet_tags: (cur.diet_tags || []).join(","),
      spice_level_max: cur.spice_level,
    };
    const filter = buildRecipeQuery(q);
    const items = await Recipe.find(filter).limit(10).lean();

    const candidates = items
      .filter((r) => r.id !== cur.id)
      .sort(
        (a, b) =>
          Math.abs(
            (a.nutrition?.calories || 0) - (cur.nutrition?.calories || 0)
          ) -
          Math.abs(
            (b.nutrition?.calories || 0) - (cur.nutrition?.calories || 0)
          )
      );

    res.json({ items: candidates.slice(0, 6) });
  } catch (e) {
    res.status(500).json({ error: "Internal error" });
  }
}
