import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getMyNotifications,
  markAsRead,
  deleteNotifications,
  subscribe,
  runMyPantryExpiryNotifications,
  runAllPantryExpiryNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// SSE stream endpoint - allows token via query param for EventSource
router.get("/stream", subscribe);

// All other notification routes require authentication
router.use(protect);

router.get("/me", getMyNotifications);
router.post("/read", markAsRead);
router.post("/delete", deleteNotifications);
router.post("/pantry-expiry/run", runMyPantryExpiryNotifications);
router.post(
  "/pantry-expiry/run-all",
  authorizeRoles("admin"),
  runAllPantryExpiryNotifications
);

export default router;
