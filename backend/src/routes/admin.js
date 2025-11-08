import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
const router = express.Router();

// Admin dashboard test - protected by role
router.get("/", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ success: true, message: "Admin route working!", user: req.user });
});

export default router;
