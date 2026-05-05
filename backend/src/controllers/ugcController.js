import Recipe from "../models/Recipe.js";
import { createNotification } from "./notificationController.js";

const parseJson = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const toNumber = (value, fallback = undefined) => {
  if (value === undefined || value === null || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
};

const normalizeIngredients = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const name = String(item?.name || "").trim();
      const unit = String(item?.unit || "").trim();
      const amount = toNumber(item?.amount, null);
      if (!name || !unit || amount === null) return null;
      return {
        name,
        unit,
        amount,
        scalable: item?.scalable !== false,
      };
    })
    .filter(Boolean);
};

const normalizeNutrition = (value) => {
  const calories = toNumber(value?.calories, 0);
  return {
    calories,
    protein_g: toNumber(value?.protein_g, 0),
    carbs_g: toNumber(value?.carbs_g, 0),
    fat_g: toNumber(value?.fat_g, 0),
    fiber_g: toNumber(value?.fiber_g, 0),
    sodium_mg: toNumber(value?.sodium_mg, 0),
    sugar_g: toNumber(value?.sugar_g, 0),
  };
};

const normalizePrice = (value) => ({
  min: toNumber(value?.min, 0),
  max: toNumber(value?.max, 0),
  currency: value?.currency || "VND",
});

export const createUGC = async (req, res) => {
  try {
    const externalId = String(req.body.external_id || "").trim();
    if (externalId) {
      const exists = await Recipe.findOne({ id: externalId }).select("_id");
      if (exists) {
        return res
          .status(409)
          .json({ success: false, message: "ID already exists" });
      }
    }

    const mealTypes = parseJson(req.body.meal_types, []);
    const ingredients = normalizeIngredients(
      parseJson(req.body.ingredients, []),
    );
    const steps = normalizeStringArray(parseJson(req.body.steps, []));

    const nutrition = normalizeNutrition(parseJson(req.body.nutrition, {}));
    const priceEstimate = normalizePrice(
      parseJson(req.body.price_estimate, {}),
    );

    const payload = {
      id: externalId || undefined,
      name_vi: req.body.name_vi,
      region: req.body.region,
      category: req.body.category,
      meal_types: normalizeStringArray(mealTypes),
      prep_time_min: toNumber(req.body.prep_time_min),
      cook_time_min: toNumber(req.body.cook_time_min),
      difficulty: req.body.difficulty,
      servings: toNumber(req.body.servings, 1),
      description: req.body.description,
      image_url: req.body.image_url,
      spice_level: toNumber(req.body.spice_level, 0),
      ingredients,
      steps,
      utensils: normalizeStringArray(parseJson(req.body.utensils, [])),
      diet_tags: normalizeStringArray(parseJson(req.body.diet_tags, [])),
      allergens: normalizeStringArray(parseJson(req.body.allergens, [])),
      taste_profile: normalizeStringArray(
        parseJson(req.body.taste_profile, []),
      ),
      suitable_for: normalizeStringArray(parseJson(req.body.suitable_for, [])),
      avoid_for: normalizeStringArray(parseJson(req.body.avoid_for, [])),
      nutrition,
      price_estimate: priceEstimate,
      is_ugc: true,
      ugc_status: "pending",
      uploaded_by: req.user._id,
    };

    if (req.file) {
      payload.cooking_video_url = `/uploads/ugc/${req.file.filename}`;
    }

    const recipe = await Recipe.create(payload);

    res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    console.error("createUGC error:", error);
    res.status(400).json({
      success: false,
      message: "Không thể gửi UGC",
      error: error.message,
    });
  }
};

export const getPendingUGC = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    const filter = { is_ugc: true, ugc_status: "pending" };
    const [items, total] = await Promise.all([
      Recipe.find(filter)
        .populate("uploaded_by", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Recipe.countDocuments(filter),
    ]);

    res.json({ success: true, items, total, page, limit });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách UGC",
      error: error.message,
    });
  }
};

export const approveUGC = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    recipe.is_ugc = true;
    recipe.ugc_status = "approved";
    recipe.ugc_reviewed_by = req.user._id;
    recipe.ugc_reviewed_at = new Date();
    recipe.ugc_reject_reason = undefined;

    await recipe.save();

    if (recipe.uploaded_by) {
      await createNotification({
        user: recipe.uploaded_by,
        audience: "user",
        title: "Công thức đã được duyệt",
        message: `Công thức '${recipe.name_vi}' đã được phê duyệt và công khai.`,
        type: "recipe",
        metadata: {
          recipeId: recipe._id,
          ugcStatus: "approved",
        },
      });
    }

    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể phê duyệt UGC",
      error: error.message,
    });
  }
};

export const rejectUGC = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    recipe.is_ugc = true;
    recipe.ugc_status = "rejected";
    recipe.ugc_reviewed_by = req.user._id;
    recipe.ugc_reviewed_at = new Date();
    recipe.ugc_reject_reason = String(req.body?.reason || "").trim();

    await recipe.save();

    if (recipe.uploaded_by) {
      const reason = recipe.ugc_reject_reason
        ? ` Lý do: ${recipe.ugc_reject_reason}`
        : "";
      await createNotification({
        user: recipe.uploaded_by,
        audience: "user",
        title: "Công thức bị từ chối",
        message: `Công thức '${recipe.name_vi}' đã bị từ chối.${reason}`,
        type: "recipe",
        metadata: {
          recipeId: recipe._id,
          ugcStatus: "rejected",
        },
      });
    }

    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể từ chối UGC",
      error: error.message,
    });
  }
};
