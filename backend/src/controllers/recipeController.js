//Recipescontroler
import Recipe from "../models/Recipe.js";
import { buildRecipeQuery } from "../utils/queryParser.js";
import { getPagination } from "../utils/pagination.js";
import { suggestDailyMenu, suggestWeeklyMenu } from "../ai_module/engine.js";
import mongoose from "mongoose";
import { createNotification } from "./notificationController.js";

const getRecipeName = (recipe) =>
  (recipe && (recipe.name_vi || recipe.name || recipe.title)) || "";

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
    console.error(" Lỗi khi lấy danh sách công thức:", e);
    res.status(500).json({ error: "Internal error" });
  }
}

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private/Admin
export async function createRecipe(req, res) {
  try {
    const recipe = await Recipe.create(req.body);
    // Thông báo cho admin về công thức mới
    await createNotification({
      user: null,
      audience: "admin",
      title: "Đã tạo công thức mới",
      message: `Công thức '${getRecipeName(recipe)}' đã được tạo`,
      type: "recipe",
      metadata: {
        recipeId: recipe._id,
      },
    });

    // Thông báo chung cho tất cả user về công thức mới
    await createNotification({
      user: null,
      audience: "user",
      title: "Có công thức mới",
      message: `Công thức mới '${getRecipeName(
        recipe
      )}' đã được thêm vào SmartMealVN`,
      type: "recipe",
      metadata: {
        recipeId: recipe._id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Tạo công thức thành công",
      data: recipe,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Không thể tạo công thức",
      error: error.message,
    });
  }
}

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private/Admin
export async function updateRecipe(req, res) {
  try {
    const idOrSlug = String(req.params.id || "").trim();
    let recipe;

    // Try to find by custom id field first
    recipe = await Recipe.findOne({ id: idOrSlug });

    // If not found and looks like ObjectId, try _id
    if (!recipe && mongoose.isValidObjectId(idOrSlug)) {
      recipe = await Recipe.findById(idOrSlug);
    }

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công thức",
      });
    }

    // Update the recipe
    Object.assign(recipe, req.body);
    await recipe.save();

    // Thông báo cho admin về việc cập nhật công thức
    await createNotification({
      user: null,
      audience: "admin",
      title: "Cập nhật công thức",
      message: `Công thức '${getRecipeName(recipe)}' đã được cập nhật`,
      type: "recipe",
      metadata: {
        recipeId: recipe._id,
      },
    });

    // Thông báo chung cho user về việc cập nhật công thức
    await createNotification({
      user: null,
      audience: "user",
      title: "Công thức đã được cập nhật",
      message: `Công thức '${getRecipeName(
        recipe
      )}' đã được cập nhật. Hãy xem lại chi tiết trước khi nấu.`,
      type: "recipe",
      metadata: {
        recipeId: recipe._id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật công thức thành công",
      data: recipe,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Không thể cập nhật công thức",
      error: error.message,
    });
  }
}

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private/Admin
export async function deleteRecipe(req, res) {
  try {
    const idOrSlug = String(req.params.id || "").trim();
    let recipe;

    // Try to find by custom id field first
    recipe = await Recipe.findOne({ id: idOrSlug });

    // If not found and looks like ObjectId, try _id
    if (!recipe && mongoose.isValidObjectId(idOrSlug)) {
      recipe = await Recipe.findById(idOrSlug);
    }

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công thức",
      });
    }

    // Delete the recipe
    await Recipe.findByIdAndDelete(recipe._id);

    // Thông báo cho admin về việc xóa công thức
    await createNotification({
      user: null,
      audience: "admin",
      title: "Xóa công thức",
      message: `Công thức '${getRecipeName(recipe)}' đã bị xóa`,
      type: "recipe",
      metadata: {
        recipeId: recipe._id,
      },
    });

    // Thông báo chung cho user về việc xóa công thức
    await createNotification({
      user: null,
      audience: "user",
      title: "Công thức đã bị xóa",
      message: `Công thức '${getRecipeName(
        recipe
      )}' không còn khả dụng trong hệ thống.`,
      type: "recipe",
      metadata: {
        recipeId: recipe._id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Xóa công thức thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa công thức",
      error: error.message,
    });
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
//  Hàm gợi ý tuần mới
export async function suggestWeeklyMenuEndpoint(req, res) {
  try {
    const prefs = req.body || {};
    const weeklyMenu = await suggestWeeklyMenu(prefs);
    res.json({ weeklyMenu });
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

//  THÊM HÀM MỚI - Swap meal theo meal_type và giữ nguyên diet_tag
export async function swapSingleMeal(req, res) {
  try {
    const { meal_type, diet_tags, exclude_ids = [] } = req.body;

    console.log(" swapMealByType nhận:", { meal_type, diet_tags, exclude_ids });

    // Build query filter
    const filter = {
      _id: { $nin: exclude_ids }, // Loại trừ món hiện tại
      meal_types: meal_type, // Chỉ lấy món có meal_type này
    };

    // Nếu có diet_tags (keto, vegetarian, etc.), thêm vào filter
    if (diet_tags && diet_tags.length > 0) {
      filter.diet_tags = { $in: diet_tags };
    }

    console.log(" Filter query:", filter);

    // Lấy tất cả món phù hợp
    const recipes = await Recipe.find(filter).lean();

    if (recipes.length === 0) {
      return res.status(404).json({
        message: `Không tìm thấy món ${meal_type} phù hợp với diet: ${diet_tags}`,
      });
    }

    // Random chọn 1 món
    const randomIndex = Math.floor(Math.random() * recipes.length);
    const randomRecipe = recipes[randomIndex];

    console.log(" Trả về món:", randomRecipe.name_vi);

    res.json({ items: [randomRecipe] });
  } catch (error) {
    console.error(" Lỗi swapMealByType:", error);
    res.status(500).json({ message: "Lỗi khi đổi món" });
  }
}
