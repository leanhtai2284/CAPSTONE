import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyNotifications,
  markAsRead,
  deleteNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// All notification routes require authentication
router.use(protect);

router.get("/me", getMyNotifications);
router.post("/read", markAsRead);
router.post("/delete", deleteNotifications);

export default router;
