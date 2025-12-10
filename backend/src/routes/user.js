import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  getRecommendations,
} from "../controllers/userController.js";

const router = express.Router();

// Protected routes (require authentication)
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/recommendations", protect, getRecommendations);

export default router;
