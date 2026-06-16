import express from "express";
import {
  protect,
  authorizeRoles,
  admin,
} from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserStats,
  banUser,
  unbanUser,
  getPendingStores,
  approveStore,
  rejectStore,
} from "../controllers/adminController.js";
import {
  getPendingUGC,
  approveUGC,
  rejectUGC,
} from "../controllers/ugcController.js";
import { updateActivityStatus } from "../controllers/userActivityController.js";
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
router.patch("/users/:id/ban", banUser);
router.patch("/users/:id/unban", unbanUser);
router.delete("/users/:id", deleteUser);
router.post("/users/update-activity", updateActivityStatus);

// Store approval routes
router.get("/stores/pending", getPendingStores);
router.patch("/stores/:id/approve", approveStore);
router.patch("/stores/:id/reject", rejectStore);

// Statistics routes
router.get("/statistics", getStatistics);
router.get("/statistics/recipes", getRecipeStatistics);
router.get("/statistics/users", getUserStatistics);

// UGC review routes
router.get("/recipes/ugc", getPendingUGC);
router.patch("/recipes/ugc/:id/approve", approveUGC);
router.patch("/recipes/ugc/:id/reject", rejectUGC);

export default router;
