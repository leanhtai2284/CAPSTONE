import express from "express";
import { protect, authorizeRoles, admin } from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserStats,
} from "../controllers/adminController.js";
import {
  getStatistics,
  getRecipeStatistics,
  getUserStatistics,
} from "../controllers/statisticsController.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, admin);

// Admin dashboard test
router.get("/", (req, res) => {
  res.json({ success: true, message: "Admin route working!", user: req.user });
});

// User management routes
router.get("/users/stats", getUserStats);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Statistics routes
router.get("/statistics", getStatistics);
router.get("/statistics/recipes", getRecipeStatistics);
router.get("/statistics/users", getUserStatistics);

export default router;
