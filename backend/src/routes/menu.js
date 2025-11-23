import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createDailyMenu,
  getDailyMenus,
  deleteDailyMenu,
} from "../controllers/menuController.js";

const router = express.Router();

// Tất cả endpoint đều yêu cầu đăng nhập
router.use(protect);

// GET /api/menus/daily
// POST /api/menus/daily
router.route("/daily").get(getDailyMenus).post(createDailyMenu);

// DELETE /api/menus/daily/:id
router.delete("/daily/:id", deleteDailyMenu);

export default router;
