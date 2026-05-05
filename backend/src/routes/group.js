import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addMember,
  removeMember,
  updateMemberRole,
  sendInvite,
  getGroupInvites,
  getPendingInvites,
  acceptInvite,
  rejectInvite,
} from "../controllers/groupController.js";
import {
  getGroupMenu,
  addMealToMenu,
  removeMealFromMenu,
  voteMeal,
  getGroupStats,
  getGroupNutrition,
} from "../controllers/groupMenuController.js";

const router = express.Router();

router.use(protect);

// Groups
router.get("/", getAllGroups);
router.post("/", createGroup);
router.get("/:id", getGroupById);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

// Members
router.get("/:id/members", getGroupMembers);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);
router.put("/:id/members/:userId", updateMemberRole);

// Invites by group
router.get("/:id/invites", getGroupInvites);
router.post("/:id/invites", sendInvite);

// Menu
router.get("/:id/menu", getGroupMenu);
router.post("/:id/menu/meals", addMealToMenu);
router.delete("/:id/menu/meals/:mealId", removeMealFromMenu);
router.post("/:id/menu/meals/:mealId/vote", voteMeal);

// Stats
router.get("/:id/stats", getGroupStats);
router.get("/:id/nutrition", getGroupNutrition);

export default router;
