import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  getAllNews,
  getFeaturedNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  likeNews,
  addComment,
} from "../controllers/newsController.js";

const router = express.Router();

// Public routes
router.get("/", getAllNews);
router.get("/featured", getFeaturedNews);
router.get("/:id", getNewsById);

// Protected routes (require authentication)
router.post("/:id/like", protect, likeNews);
router.post("/:id/comment", protect, addComment);

// Admin routes (require admin role)
router.post("/", protect, admin, upload.single("image"), createNews);
router.put("/:id", protect, admin, upload.single("image"), updateNews);
router.delete("/:id", protect, admin, deleteNews);

export default router;
