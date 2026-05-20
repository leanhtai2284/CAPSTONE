import Recipe from "../models/Recipe.js";
import { estimateRecipe } from "../utils/recipeEstimate.js";
import { retrieveNutritionFromDataset } from "../utils/dishNutritionRetrieval.js";
import { createNotification } from "./notificationController.js";
import { uploadImage, uploadVideo } from "../services/cloudinary.js";

const UGC_IMAGE_FOLDER = "smartmeal/ugc/images";
const UGC_VIDEO_FOLDER = "smartmeal/ugc/videos";

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

const DIACRITIC_MAP = {
  "giau dam": "giàu đạm",
  "dam da": "đậm đà",
  "an chay": "ăn chay",
  "nhieu chat xo": "nhiều chất xơ",
  "it calo": "ít calo",
  "it carb": "ít carb",
  "it beo": "ít béo",
  nhat: "nhạt",
  ngot: "ngọt",
  beo: "béo",
  chua: "chua",
  man: "mặn",
  cay: "cay",
  thom: "thơm",
  am: "ấm",
  chao: "chảo",
  noi: "nồi",
  "lo nuong": "lò nướng",
  "noi hap": "nồi hấp",
  "may xay": "máy xay",
  "to tron": "tô trộn",
  dao: "dao",
  thot: "thớt",
  "giam can": "giảm cân",
  "tang co": "tăng cơ",
  "an kieng": "ăn kiêng",
  "tre em": "trẻ em",
  "tieu duong": "tiểu đường",
  "cao huyet ap": "cao huyết áp",
  "da day yeu": "dạ dày yếu",
  "di ung hat": "dị ứng hạt",
  "hai san": "hải sản",
  "dau nanh": "đậu nành",
  sua: "sữa",
  ca: "cá",
  trung: "trứng",
  "dau phong": "đậu phộng",
  hat: "hạt",
};

const normalizeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const toVietnameseDiacritics = (value) => {
  const key = normalizeKey(value);
  return DIACRITIC_MAP[key] || value;
};

const normalizeHeuristicList = (value) =>
  normalizeStringArray(value)
    .map((item) => toVietnameseDiacritics(item))
    .filter(Boolean);

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

const normalizeIngredientsForHeuristic = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const name = String(item?.name || "").trim();
      if (!name) return null;
      const unit = String(item?.unit || "").trim() || "g";
      const amount = toNumber(item?.amount, 100);
      return {
        name,
        unit,
        amount,
        scalable: item?.scalable !== false,
      };
    })
    .filter(Boolean);
};

const normalizeIngredientNames = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      return String(item?.name || "").trim();
    })
    .filter(Boolean)
    .map((name) => ({ name }));
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

export const estimateUGC = async (req, res) => {
  try {
    const ingredientNames = normalizeIngredientNames(
      req.body.ingredients || [],
    );
    const ingredients = normalizeIngredientsForHeuristic(
      req.body.ingredients || [],
    );
    const steps = normalizeStringArray(req.body.steps || []);
    const servingsNum = toNumber(req.body.servings, 1);
    const spiceLevel = toNumber(req.body.spice_level, 0);

    const estimation = estimateRecipe({
      ingredients,
      steps,
      servings: servingsNum,
      spice_level: spiceLevel,
    });

    const datasetEstimate = await retrieveNutritionFromDataset({
      name: req.body.name_vi || req.body.name || "",
      ingredients: ingredientNames,
    });

    if (!datasetEstimate) {
      const fallbackNutrition = normalizeNutrition(estimation?.nutrition || {});
      const fallbackPrice = normalizePrice(estimation?.price_estimate || {});

      return res.json({
        success: true,
        data: {
          nutrition: fallbackNutrition,
          price_estimate: fallbackPrice,
          diet_tags: normalizeHeuristicList(estimation?.diet_tags || []),
          allergens: normalizeHeuristicList(estimation?.allergens || []),
          taste_profile: normalizeHeuristicList(
            estimation?.taste_profile || [],
          ),
          utensils: normalizeHeuristicList(estimation?.utensils || []),
          suitable_for: normalizeHeuristicList(estimation?.suitable_for || []),
          avoid_for: normalizeHeuristicList(estimation?.avoid_for || []),
          source: "ingredient",
        },
      });
    }

    const nutrition = normalizeNutrition(datasetEstimate.nutrition || {});
    const priceEstimate = normalizePrice(datasetEstimate.price_estimate || {});

    res.json({
      success: true,
      data: {
        nutrition,
        price_estimate: priceEstimate,
        diet_tags: normalizeHeuristicList(estimation?.diet_tags || []),
        allergens: normalizeHeuristicList(estimation?.allergens || []),
        taste_profile: normalizeHeuristicList(estimation?.taste_profile || []),
        utensils: normalizeHeuristicList(estimation?.utensils || []),
        suitable_for: normalizeHeuristicList(estimation?.suitable_for || []),
        avoid_for: normalizeHeuristicList(estimation?.avoid_for || []),
        source: "dataset",
      },
    });
  } catch (error) {
    console.error("estimateUGC error:", error);
    res.status(400).json({
      success: false,
      message: "Không thể ước tính dinh dưỡng",
      error: error.message,
    });
  }
};

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
    const rawIngredients = parseJson(req.body.ingredients, []);
    const ingredients = normalizeIngredients(rawIngredients);
    const ingredientNames = normalizeIngredientNames(rawIngredients);
    const steps = normalizeStringArray(parseJson(req.body.steps, []));

    const servingsNum = toNumber(req.body.servings, 1);
    const spiceLevel = toNumber(req.body.spice_level, 0);

    const nutrition = {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sodium_mg: 0,
      sugar_g: 0,
    };
    const priceEstimate = {
      min: 0,
      max: 0,
      currency: "VND",
    };

    const dietTags = [];
    const allergens = [];
    const tasteProfile = [];
    const utensils = [];
    const suitableFor = [];
    const avoidFor = [];

    const payload = {
      name_vi: req.body.name_vi,
      region: req.body.region,
      category: req.body.category,
      meal_types: normalizeStringArray(mealTypes),
      prep_time_min: toNumber(req.body.prep_time_min),
      cook_time_min: toNumber(req.body.cook_time_min),
      difficulty: req.body.difficulty,
      servings: servingsNum,
      description: req.body.description,
      image_url: req.body.image_url,
      spice_level: spiceLevel,
      ingredients,
      steps,
      utensils,
      diet_tags: dietTags,
      allergens,
      taste_profile: tasteProfile,
      suitable_for: suitableFor,
      avoid_for: avoidFor,
      nutrition,
      price_estimate: priceEstimate,
      is_ugc: true,
      ugc_status: "pending",
      uploaded_by: req.user._id,
    };

    if (externalId) {
      payload.id = externalId;
    }

    // Handle uploaded images
    const imageFiles = Array.isArray(req.files?.recipe_images)
      ? req.files.recipe_images
      : [];
    if (imageFiles.length > 0) {
      const uploads = await Promise.all(
        imageFiles.map((file) =>
          uploadImage(file.buffer, { folder: UGC_IMAGE_FOLDER }),
        ),
      );
      const urls = uploads.map((item) => item?.secure_url).filter(Boolean);
      if (urls.length > 0) {
        payload.image_url = urls[0];
        payload.additional_images = urls;
      }
    }

    // Handle uploaded video
    const videoFile = Array.isArray(req.files?.cooking_video)
      ? req.files.cooking_video[0]
      : req.file || null;

    if (videoFile) {
      const uploaded = await uploadVideo(videoFile.buffer, {
        folder: UGC_VIDEO_FOLDER,
      });
      payload.cooking_video_url = uploaded?.secure_url || "";
    }

    const recipe = await Recipe.create(payload);
    const data = recipe.toObject();

    if (videoFile && !data.cooking_video_url && payload.cooking_video_url) {
      data.cooking_video_url = payload.cooking_video_url;
    }

    res.status(201).json({ success: true, data });
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
