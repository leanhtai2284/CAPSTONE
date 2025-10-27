import Recipe from "../models/Recipe.js";
import { buildRecipeQuery } from "../utils/queryParser.js";
import { getPagination } from "../utils/pagination.js";
import { suggestDailyMenu } from "../ai_module/engine.js";

export async function searchRecipes(req, res) {
  try {
    const filter = buildRecipeQuery(req.query);
    const { limit, skip } = getPagination(req);

    const cursor = Recipe.find(filter).skip(skip).limit(limit);
    if (filter.$text) {
      cursor.sort({ score: { $meta: "textScore" } });
      cursor.select({ score: { $meta: "textScore" } });
    } else {
      cursor.sort({ createdAt: -1 });
    }

    const [items, total] = await Promise.all([
      cursor.lean(),
      Recipe.countDocuments(filter),
    ]);
    res.json({ items, total, limit, page: Number(req.query.page || 1) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function getRecipeById(req, res) {
  try {
    const idOrSlug = req.params.id;
    const recipe = await Recipe.findOne({
      $or: [{ _id: idOrSlug }, { id: idOrSlug }],
    }).lean();
    if (!recipe) return res.status(404).json({ error: "Not found" });
    res.json(recipe);
  } catch (e) {
    res.status(500).json({ error: "Internal error" });
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
