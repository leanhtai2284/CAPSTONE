import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();

// User gửi feedback
router.post("/", protect, createFeedback);

// Admin quản lý feedback
router.get("/", protect, authorizeRoles("admin"), getAllFeedback);
router.get("/:id", protect, authorizeRoles("admin"), getFeedbackById);
router.put("/:id", protect, authorizeRoles("admin"), updateFeedback);
router.delete("/:id", protect, authorizeRoles("admin"), deleteFeedback);

export default router;
