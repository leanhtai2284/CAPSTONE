//Recipescontroler
import Recipe from "../models/Recipe.js";
import { buildRecipeQuery } from "../utils/queryParser.js";
import { getPagination } from "../utils/pagination.js";
import { suggestDailyMenu, suggestWeeklyMenu } from "../ai_module/engine.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Pantry from "../models/Pantry.js";
import { createNotification } from "./notificationController.js";

const getRecipeName = (recipe) =>
  (recipe && (recipe.name_vi || recipe.name || recipe.title)) || "";

export async function searchRecipes(req, res) {
  try {
    // 1️⃣ Xây filter dựa trên query (nếu có)
    const filter = buildRecipeQuery(req.query);
    const limit = Number(req.query.limit);

    // 2️⃣ Chỉ lấy công thức đã được duyệt - loại bỏ UGC pending/rejected
    // Public recipes: either not UGC, or UGC with approved status
    filter.$or = [
      { is_ugc: { $ne: true } }, // Regular recipes (not UGC)
      { is_ugc: true, ugc_status: "approved" } // Approved UGC recipes
    ];

    // 3️⃣ Lấy toàn bộ dữ liệu, sắp xếp theo món mới nhất
    let query = Recipe.find(filter).sort({ createdAt: -1 });
    if (Number.isFinite(limit) && limit > 0) {
      query = query.limit(limit);
    }
    const items = await query.lean();

    // 4️⃣ Trả kết quả ra API
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
    console.log('=== CREATE RECIPE DEBUG ===');
    console.log('req.body keys:', Object.keys(req.body || {}));
    console.log('req.file:', req.file);
    console.log('req.files:', req.files);
    
    // Handle both JSON and FormData (for video upload)
    let recipeData;
    
    if (req.body && Object.keys(req.body).length > 0) {
      // FormData case - parse JSON fields
      recipeData = {};
      Object.keys(req.body).forEach(key => {
        try {
          if (key === 'nutrition' || key === 'price_estimate' || key === 'ingredients' || key === 'steps' || key === 'meal_types' || key === 'utensils' || key === 'diet_tags' || key === 'allergens' || key === 'taste_profile' || key === 'suitable_for' || key === 'avoid_for') {
            recipeData[key] = JSON.parse(req.body[key]);
          } else if (key === 'cooking_video_url') {
            // Handle video URL - empty string means delete video
            recipeData[key] = req.body[key] || undefined;
          } else {
            recipeData[key] = req.body[key];
          }
        } catch (parseError) {
          console.error(`Error parsing field ${key}:`, parseError);
          console.error(`Field value:`, req.body[key]);
          throw new Error(`Invalid data format for field: ${key}`);
        }
      });
    } else {
      // Regular JSON case
      recipeData = req.body;
    }

    // Handle video file
    const videoFile = req.file || (Array.isArray(req.files?.cooking_video) ? req.files.cooking_video[0] : null);
    if (videoFile) {
      recipeData.cooking_video_url = `/uploads/ugc/${videoFile.filename}`;
    }

    console.log('Creating recipe with data:', recipeData);
    
    // Check if ID already exists
    if (recipeData.id) {
      const existingRecipe = await Recipe.findOne({ id: recipeData.id });
      if (existingRecipe) {
        return res.status(400).json({
          success: false,
          message: `ID "${recipeData.id}" đã tồn tại. Vui lòng chọn ID khác.`,
          error: 'DUPLICATE_ID'
        });
      }
    }
    
    const recipe = await Recipe.create(recipeData);
    console.log('Recipe created successfully:', recipe);
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
        recipe,
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
    console.error("[createRecipe] ERROR:", error);
    console.error("Error stack:", error.stack);
    console.error("Recipe data that caused error:", recipeData);
    res.status(400).json({
      success: false,
      message: error.message || "Không thể tạo công thức",
      details: error.stack
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

    // Handle both JSON and FormData (for video upload)
    let updateData;
    
    if (req.body && Object.keys(req.body).length > 0) {
      // FormData case - parse JSON fields
      updateData = {};
      Object.keys(req.body).forEach(key => {
        if (key === 'nutrition' || key === 'price_estimate' || key === 'ingredients' || key === 'steps' || key === 'meal_types' || key === 'utensils' || key === 'diet_tags' || key === 'allergens' || key === 'taste_profile' || key === 'suitable_for' || key === 'avoid_for') {
          updateData[key] = JSON.parse(req.body[key]);
        } else if (key === 'cooking_video_url') {
          // Handle video URL - empty string means delete video
          updateData[key] = req.body[key] || undefined;
        } else {
          updateData[key] = req.body[key];
        }
      });
    } else {
      // Regular JSON case
      updateData = req.body;
    }

    // Handle video file
    const videoFile = req.file || (Array.isArray(req.files?.cooking_video) ? req.files.cooking_video[0] : null);
    if (videoFile) {
      updateData.cooking_video_url = `/uploads/ugc/${videoFile.filename}`;
    }

    // Update the recipe
    Object.assign(recipe, updateData);
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
        recipe,
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
        recipe,
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
            typeof ing.scalable === "boolean" ? ing.scalable : true; // default: true - tất cả đều scale
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
        idOrSlug,
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
    let userId = null;

    // Lấy userId từ JWT nếu user đang login
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn("Invalid token for suggestMenu, ignoring...");
      }
    }

    let pantryItems = [];
    if (userId && prefs.use_pantry !== false) {
      pantryItems = await Pantry.find({ user: userId }).lean();
    }

    const items = await suggestDailyMenu(prefs, pantryItems);
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
    let userId = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn("Invalid token for suggestWeeklyMenu, ignoring...");
      }
    }

    let pantryItems = [];
    if (userId && prefs.use_pantry !== false) {
      pantryItems = await Pantry.find({ user: userId }).lean();
    }

    const weeklyMenu = await suggestWeeklyMenu(prefs, pantryItems);
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
            (a.nutrition?.calories || 0) - (cur.nutrition?.calories || 0),
          ) -
          Math.abs(
            (b.nutrition?.calories || 0) - (cur.nutrition?.calories || 0),
          ),
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

    console.log(" swapSingleMeal nhận:", {
      meal_type,
      diet_tags,
      exclude_ids,
    });

    const filter = {
      _id: { $nin: exclude_ids },
      meal_types: meal_type,
    };

    if (diet_tags && diet_tags.length > 0) {
      filter.diet_tags = { $in: diet_tags };
    }

    console.log("🔍 Filter query:", filter);

    let recipes = await Recipe.find(filter).lean();

    //  LỌC: Chỉ lấy món có ĐÚNG 1 meal_type
    recipes = recipes.filter(
      (r) =>
        r.meal_types &&
        r.meal_types.length === 1 &&
        r.meal_types[0] === meal_type,
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        message: `Không tìm thấy món ${meal_type} riêng lẻ`,
      });
    }

    const randomIndex = Math.floor(Math.random() * recipes.length);
    const randomRecipe = recipes[randomIndex];

    console.log(" Trả về:", randomRecipe.name_vi, randomRecipe.meal_types);

    res.json({ items: [randomRecipe] });
  } catch (error) {
    console.error("❌ Lỗi:", error);
    res.status(500).json({ message: "Lỗi khi đổi món" });
  }
}

/**
 * POST /api/recipes/shopping-list
 * Nhận vào danh sách recipeId (từ kết quả suggest-weekly),
 * so sánh với Pantry của user → Xuất danh sách nguyên liệu cần mua.
 *
 * Body: { recipeIds: ["id1", "id2", ...] }
 * Auth: JWT (tùy chọn – có token thì tự trừ đồ đang có trong Pantry)
 */
export async function generateShoppingList(req, res) {
  try {
    const { recipeIds } = req.body;

    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Cần truyền recipeIds là mảng không rỗng" });
    }

    // 1. Lấy tất cả công thức được yêu cầu
    const recipes = await Recipe.find({ _id: { $in: recipeIds } }).lean();

    // 2. Gom tất cả nguyên liệu (tổng hợp theo tên)
    const needed = new Map();
    for (const recipe of recipes) {
      for (const ing of recipe.ingredients || []) {
        const name = String(ing?.name ?? ing)
          .toLowerCase()
          .trim();
        const qty = Number(ing?.amount) || 0;
        const unit = String(ing?.unit ?? "").trim();

        if (!needed.has(name)) {
          needed.set(name, {
            name: ing?.name ?? ing,
            totalQty: 0,
            unit,
            usedIn: [],
          });
        }
        const entry = needed.get(name);
        entry.totalQty += qty;
        entry.usedIn.push(recipe.name_vi || recipe.name || String(recipe._id));
      }
    }

    // 3. Lấy Pantry của user (nếu có token hợp lệ)
    const pantryMap = new Map();
    if (req.headers.authorization?.startsWith("Bearer ")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const pantryItems = await Pantry.find({ user: decoded.id }).lean();
        for (const p of pantryItems) {
          pantryMap.set(String(p.name).toLowerCase().trim(), {
            quantity: p.quantity,
            unit: p.unit,
          });
        }
      } catch {
        /* Token lỗi → không trừ pantry */
      }
    }

    // 4. So sánh cần vs có → tính phần còn thiếu
    const shoppingList = [];
    const alreadyHave = [];

    for (const [key, item] of needed.entries()) {
      const inPantry = pantryMap.get(key);

      if (!inPantry) {
        shoppingList.push({
          name: item.name,
          need: item.totalQty || null,
          unit: item.unit || null,
          usedIn: item.usedIn,
          status: "missing",
        });
      } else if (inPantry.quantity < item.totalQty) {
        shoppingList.push({
          name: item.name,
          need: +(item.totalQty - inPantry.quantity).toFixed(2),
          unit: item.unit || inPantry.unit,
          have: inPantry.quantity,
          usedIn: item.usedIn,
          status: "insufficient",
        });
      } else {
        alreadyHave.push({
          name: item.name,
          have: inPantry.quantity,
          unit: inPantry.unit,
        });
      }
    }

    return res.json({
      success: true,
      summary: {
        total_ingredients: needed.size,
        need_to_buy: shoppingList.length,
        already_have: alreadyHave.length,
      },
      shopping_list: shoppingList,
      already_have: alreadyHave,
    });
  } catch (e) {
    console.error("[generateShoppingList]", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
