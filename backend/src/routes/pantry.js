import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createPantryItem,
  getPantryItems,
  getPantryItemById,
  updatePantryItem,
  deletePantryItem,
} from "../controllers/pantryController.js";

const router = express.Router();

// Tất cả endpoint Pantry yêu cầu user đã đăng nhập
router.use(protect);

// Danh sách + tạo mới pantry item
router.route("/").get(getPantryItems).post(createPantryItem);
// Chi tiết + cập nhật + xoá theo id
router.route("/:id").get(getPantryItemById).put(updatePantryItem).delete(deletePantryItem);

export default router;
