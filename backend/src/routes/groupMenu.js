import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getGroupMenu,
  addMealToMenu,
  removeMealFromMenu,
  voteMeal,
  getGroupStats,
  getGroupNutrition,
  getRecipesForGroupMenu,
} from "../controllers/groupMenuController.js";

const router = express.Router();

router.use(protect);

// Get recipes for adding to group menu
router.get("/recipes", getRecipesForGroupMenu);

// Menu
router.get("/:id/menu", getGroupMenu);
router.post("/:id/menu/meals", addMealToMenu);
router.delete("/:id/menu/meals/:mealId", removeMealFromMenu);
router.post("/:id/menu/meals/:mealId/vote", voteMeal);

// Stats
router.get("/:id/stats", getGroupStats);
router.get("/:id/nutrition", getGroupNutrition);

export default router;
