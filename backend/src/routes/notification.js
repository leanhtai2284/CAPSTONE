import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyNotifications,
  markAsRead,
  deleteNotifications,
  subscribe,
} from "../controllers/notificationController.js";

const router = express.Router();

// SSE stream endpoint - allows token via query param for EventSource
router.get("/stream", subscribe);

// All other notification routes require authentication
router.use(protect);

router.get("/me", getMyNotifications);
router.post("/read", markAsRead);
router.post("/delete", deleteNotifications);

export default router;
