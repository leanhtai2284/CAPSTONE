import mongoose from "mongoose";
import Group from "../models/Group.js";
import GroupInvite from "../models/GroupInvite.js";
import GroupMenu from "../models/GroupMenu.js";
import Recipe from "../models/Recipe.js";
import Pantry from "../models/Pantry.js";
import DailyTracking from "../models/DailyTracking.js";

const isOwner = (group, userId) =>
  group.owner?.toString() === userId.toString() ||
  group.createdBy?.toString() === userId.toString();

const getMemberUserId = (member) => {
  if (!member?.user) return null;
  return member.user._id ? member.user._id.toString() : member.user.toString();
};

const getMemberRole = (group, userId) => {
  const member = group.members.find(
    (m) => getMemberUserId(m) === userId.toString(),
  );
  return member?.role;
};

const isMember = (group, userId) =>
  isOwner(group, userId) ||
  group.members.some((m) => getMemberUserId(m) === userId.toString());

const canManageMenu = (group, userId) => {
  if (isOwner(group, userId)) return true;
  return isMember(group, userId); // All members can add meals to menu
};

const hasPendingInvite = async (groupId, email) => {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalizedEmail) return false;
  const invite = await GroupInvite.findOne({
    group: groupId,
    email: normalizedEmail,
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).select("_id");
  return Boolean(invite);
};

const mapMeal = (menuItem) => {
  const meal = menuItem.meal || {};
  const nutrition = meal.nutrition || {};

  return {
    _id: meal._id,
    name: meal.name,
    name_vi: meal.name_vi,
    title: meal.title,
    description: meal.description,
    nutrition: {
      calories: nutrition.calories || 0,
      protein: nutrition.protein_g || nutrition.protein || 0,
      carbs: nutrition.carbs_g || nutrition.carbs || 0,
      fat: nutrition.fat_g || nutrition.fat || 0,
    },
    ingredients: meal.ingredients || [],
    suggestedBy: menuItem.suggestedBy?.name,
    votes: menuItem.votes || 0,
    addedAt: menuItem.addedAt,
    note: menuItem.note || "",
  };
};

export const getGroupMenu = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!isMember(group, req.user._id)) {
      const invited = await hasPendingInvite(group._id, req.user.email);
      if (!invited) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    const menu = await GroupMenu.findOne({ group: group._id })
      .populate("meals.meal")
      .populate("meals.suggestedBy", "name");

    const items = menu?.meals?.map(mapMeal) || [];
    res.json({ success: true, data: items });
  } catch (error) {
    console.error("Error getGroupMenu:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const addMealToMenu = async (req, res) => {
  try {
    const { mealId, note } = req.body;
    
    // Debug logging
    console.log("🔍 Debug - Request body:", req.body);
    console.log("🔍 Debug - mealId:", mealId);
    console.log("🔍 Debug - mealId type:", typeof mealId);
    
    // Validate mealId
    if (!mealId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu ID công thức" });
    }

    if (typeof mealId !== 'string' && typeof mealId !== 'object') {
      return res
        .status(400)
        .json({ success: false, message: "ID công thức không hợp lệ" });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nhóm" });
    }

    if (!isMember(group, req.user._id)) {
      const invited = await hasPendingInvite(group._id, req.user.email);
      if (!invited) {
        return res
          .status(403)
          .json({ success: false, message: "Bạn không có quyền truy cập nhóm này" });
      }
    }

    // Try multiple ways to find the recipe
    let recipe = null;
    
    // Try by ObjectId first
    if (mongoose.Types.ObjectId.isValid(mealId)) {
      recipe = await Recipe.findById(mealId);
      console.log("🔍 Debug - Found by ObjectId:", !!recipe);
    }
    
    // If not found, try by custom id field
    if (!recipe) {
      recipe = await Recipe.findOne({ id: mealId });
      console.log("🔍 Debug - Found by custom id:", !!recipe);
    }
    
    // If still not found, try by name_vi
    if (!recipe) {
      recipe = await Recipe.findOne({ name_vi: mealId });
      console.log("🔍 Debug - Found by name_vi:", !!recipe);
    }

    if (!recipe) {
      console.log("❌ Recipe not found for mealId:", mealId);
      return res
        .status(404)
        .json({ 
          success: false, 
          message: "Không tìm thấy công thức",
          debug: {
            mealId,
            mealIdType: typeof mealId,
            searchedFields: ['_id', 'id', 'name_vi']
          }
        });
    }

    const menu =
      (await GroupMenu.findOne({ group: group._id })) ||
      (await GroupMenu.create({ group: group._id, meals: [] }));

    const exists = menu.meals.some(
      (m) => m.meal?.toString() === recipe._id.toString(),
    );

    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Món ăn đã có trong menu" });
    }

    menu.meals.push({
      meal: recipe._id,
      suggestedBy: req.user._id,
      addedAt: new Date(),
      votes: 0,
      votedBy: [],
      note: note || "",
    });

    await menu.save();

    await menu.populate([
      { path: "meals.meal" },
      { path: "meals.suggestedBy", select: "name" }
    ]);

    const addedItem = menu.meals.find(
      (m) => m.meal?._id?.toString() === recipe._id.toString(),
    );

    res.status(201).json({ success: true, data: mapMeal(addedItem) });
  } catch (error) {
    console.error("Error addMealToMenu:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const removeMealFromMenu = async (req, res) => {
  try {
    const { mealId } = req.params;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!canManageMenu(group, req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const menu = await GroupMenu.findOne({ group: group._id });
    if (!menu) {
      return res
        .status(404)
        .json({ success: false, message: "Menu not found" });
    }

    menu.meals = menu.meals.filter((m) => m.meal?.toString() !== mealId);

    await menu.save();

    res.json({ success: true, message: "Meal removed" });
  } catch (error) {
    console.error("Error removeMealFromMenu:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const voteMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const { vote } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!isMember(group, req.user._id)) {
      const invited = await hasPendingInvite(group._id, req.user.email);
      if (!invited) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    const menu = await GroupMenu.findOne({ group: group._id });
    if (!menu) {
      return res
        .status(404)
        .json({ success: false, message: "Menu not found" });
    }

    const item = menu.meals.find((m) => m.meal?.toString() === mealId);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Meal not found" });
    }

    const userId = req.user._id.toString();
    const votedIndex = item.votedBy.findIndex((id) => id.toString() === userId);

    if (vote) {
      if (votedIndex === -1) {
        item.votedBy.push(req.user._id);
      }
    } else if (votedIndex >= 0) {
      item.votedBy.splice(votedIndex, 1);
    }

    item.votes = item.votedBy.length;
    await menu.save();

    res.json({ success: true, data: { mealId, votes: item.votes } });
  } catch (error) {
    console.error("Error voteMeal:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const getGroupStats = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!isMember(group, req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const menu = await GroupMenu.findOne({ group: group._id });
    const mealsCount = menu?.meals?.length || 0;
    const totalVotes = menu?.meals?.reduce((sum, m) => sum + (m.votes || 0), 0);

    res.json({
      success: true,
      data: {
        members: group.members.length,
        meals: mealsCount,
        totalVotes,
      },
    });
  } catch (error) {
    console.error("Error getGroupStats:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const getGroupNutrition = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (!isMember(group, req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const menu = await GroupMenu.findOne({ group: group._id }).populate(
      "meals.meal",
      "nutrition",
    );

    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const meals = menu?.meals || [];

    // Chỉ tính toán dựa trên các món có lượng vote cao nhất (món được nhóm lựa chọn)
    const maxVotes = meals.length ? Math.max(...meals.map(m => m.votes || 0)) : 0;
    const activeMeals = maxVotes > 0 
      ? meals.filter(m => (m.votes || 0) === maxVotes)
      : meals;

    activeMeals.forEach((item) => {
      const nutrition = item.meal?.nutrition || {};
      totals.calories += nutrition.calories || 0;
      totals.protein += nutrition.protein_g || nutrition.protein || 0;
      totals.carbs += nutrition.carbs_g || nutrition.carbs || 0;
      totals.fat += nutrition.fat_g || nutrition.fat || 0;
    });

    res.json({
      success: true,
      data: {
        total: totals,
        average: activeMeals.length
          ? {
              calories: Math.round(totals.calories / activeMeals.length),
              protein: Math.round(totals.protein / activeMeals.length),
              carbs: Math.round(totals.carbs / activeMeals.length),
              fat: Math.round(totals.fat / activeMeals.length),
            }
          : { calories: 0, protein: 0, carbs: 0, fat: 0 },
      },
    });
  } catch (error) {
    console.error("Error getGroupNutrition:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Get recipes for group menu
export const getRecipesForGroupMenu = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name_vi: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ]
      };
    }
    
    const recipes = await Recipe.find(query)
      .select("_id name_vi description image_url nutrition prep_time_min cook_time_min servings")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();
    
    const total = await Recipe.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        items: recipes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page * limit < total,
        }
      }
    });
  } catch (error) {
    console.error("Error getting recipes for group menu:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Đồng bộ món ăn nhóm vào Nhật ký dinh dưỡng cá nhân hôm nay
export const logGroupMealToPersonalTracker = async (req, res) => {
  try {
    const { mealId } = req.body;
    const userId = req.user._id;

    if (!mealId) {
      return res.status(400).json({ success: false, message: "Thiếu ID công thức" });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhóm" });
    }

    if (!isMember(group, userId)) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập nhóm này" });
    }

    const recipe = await Recipe.findById(mealId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: "Không tìm thấy món ăn" });
    }

    // Cộng dinh dưỡng vào DailyTracking hôm nay (Không trừ tủ lạnh cá nhân vì nguyên liệu dã ngoại nhóm mua riêng)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nutrition = recipe.nutrition || {};
    const mealEntry = {
      recipeId: recipe._id,
      name_vi: recipe.name_vi,
      eaten_at: new Date(),
      nutrition: {
        calories:   nutrition.calories   || 0,
        protein_g:  nutrition.protein_g  || 0,
        carbs_g:    nutrition.carbs_g    || 0,
        fat_g:      nutrition.fat_g      || 0,
        fiber_g:    nutrition.fiber_g    || 0,
        sodium_mg:  nutrition.sodium_mg  || 0,
        sugar_g:    nutrition.sugar_g    || 0,
      },
    };

    const tracking = await DailyTracking.findOneAndUpdate(
      { user: userId, date: today },
      {
        $push: { meals_eaten: mealEntry },
        $inc: {
          "daily_totals.calories":  mealEntry.nutrition.calories,
          "daily_totals.protein_g": mealEntry.nutrition.protein_g,
          "daily_totals.carbs_g":   mealEntry.nutrition.carbs_g,
          "daily_totals.fat_g":     mealEntry.nutrition.fat_g,
          "daily_totals.fiber_g":   mealEntry.nutrition.fiber_g,
          "daily_totals.sodium_mg": mealEntry.nutrition.sodium_mg,
          "daily_totals.sugar_g":   mealEntry.nutrition.sugar_g,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: `Đã đồng bộ món "${recipe.name_vi}" vào nhật ký ăn uống hôm nay của bạn!`,
      data: {
        today_totals: tracking.daily_totals,
      }
    });
  } catch (error) {
    console.error("Error in logGroupMealToPersonalTracker:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const getCheckedIngredients = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhóm" });
    }

    const menu = await GroupMenu.findOne({ group: group._id });
    res.json({
      success: true,
      checkedIngredients: menu?.checkedIngredients || []
    });
  } catch (error) {
    console.error("Error in getCheckedIngredients:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const toggleCheckedIngredient = async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ success: false, message: "Thiếu key nguyên liệu" });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhóm" });
    }

    const menu =
      (await GroupMenu.findOne({ group: group._id })) ||
      (await GroupMenu.create({ group: group._id, meals: [] }));

    const index = menu.checkedIngredients.indexOf(key);
    if (index > -1) {
      menu.checkedIngredients.splice(index, 1);
    } else {
      menu.checkedIngredients.push(key);
    }

    await menu.save();

    res.json({
      success: true,
      checkedIngredients: menu.checkedIngredients
    });
  } catch (error) {
    console.error("Error in toggleCheckedIngredient:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
