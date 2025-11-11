import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getUserNutritionReport } from "../controllers/reportController.js";

const router = express.Router();

// All report endpoints require authentication
router.use(protect);

// GET /api/reports/nutrition
router.get("/nutrition", getUserNutritionReport);

export default router;
