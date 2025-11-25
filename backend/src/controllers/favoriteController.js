import Favorite from "../models/Favorite.js";

// GET /api/favorites
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: favorites,
    });
  } catch (err) {
    console.error("Error getFavorites:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/favorites
export const addFavorite = async (req, res) => {
  try {
    const { recipeId, meal } = req.body;

    if (!recipeId || !meal) {
      return res.status(400).json({
        success: false,
        message: "Thiếu recipeId hoặc meal",
      });
    }

    const favorite = await Favorite.findOneAndUpdate(
      { user: req.user._id, recipeId },
      { meal },
      { new: true, upsert: true } // nếu chưa có thì tạo mới
    );

    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (err) {
    console.error("Error addFavorite:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// DELETE /api/favorites/by-recipe/:recipeId
export const removeFavoriteByRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      recipeId,
    });

    if (!favorite) {
      return res
        .status(404)
        .json({ success: false, message: "Món này chưa được lưu" });
    }

    res.json({ success: true, message: "Đã bỏ lưu món ăn" });
  } catch (err) {
    console.error("Error removeFavoriteByRecipe:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
