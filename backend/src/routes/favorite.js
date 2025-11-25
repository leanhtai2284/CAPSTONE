import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getFavorites,
  addFavorite,
  removeFavoriteByRecipe,
} from "../controllers/favoriteController.js";

const router = express.Router();

// Tất cả API favorite đều cần đăng nhập
router.use(protect);

// GET /api/favorites  -> lấy danh sách món đã lưu
router.get("/", getFavorites);

// POST /api/favorites -> lưu / cập nhật món yêu thích
router.post("/", addFavorite);

// DELETE /api/favorites/by-recipe/:recipeId -> bỏ lưu theo id món
router.delete("/by-recipe/:recipeId", removeFavoriteByRecipe);

export default router;
