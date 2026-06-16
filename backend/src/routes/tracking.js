import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  markAsCooked,
  getTodayTracking,
  getTrackingHistory,
  getWeeklyReport,
} from "../controllers/trackingController.js";

const router = express.Router();

// Tất cả endpoint đều yêu cầu đăng nhập
router.use(protect);

// POST /api/tracking/mark-as-cooked  → Đánh dấu đã nấu, trừ tủ lạnh, cộng calo
router.post("/mark-as-cooked", markAsCooked);

// GET /api/tracking/today         → Xem tổng dinh dưỡng hôm nay
router.get("/today", getTodayTracking);

// GET /api/tracking/history?days=7 → Xem lịch sử 7 ngày gần nhất
router.get("/history", getTrackingHistory);

// GET /api/tracking/weekly-report → Báo cáo tuần kèm AI Insight
router.get("/weekly-report", getWeeklyReport);

export default router;
