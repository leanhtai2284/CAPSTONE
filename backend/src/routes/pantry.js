import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createPantryItem,
  getPantryItems,
  getPantryItemById,
  getPantrySummary,
  bulkDeletePantryItems,
  bulkUpdatePantryQuantities,
  updatePantryItem,
  deletePantryItem,
} from "../controllers/pantryController.js";

const router = express.Router();

// Tất cả endpoint Pantry yêu cầu user đã đăng nhập
router.use(protect);

// Danh sách + tạo mới pantry item
router.route("/").get(getPantryItems).post(createPantryItem);
// Tổng quan số lượng theo trạng thái
router.get("/summary", getPantrySummary);
// Chức năng bulk độc lập
router.post("/bulk/delete", bulkDeletePantryItems);
router.post("/bulk/quantity", bulkUpdatePantryQuantities);
// Chi tiết + cập nhật + xoá theo id
router.route("/:id").get(getPantryItemById).put(updatePantryItem).delete(deletePantryItem);

export default router;
