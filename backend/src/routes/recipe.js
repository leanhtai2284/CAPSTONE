import express from "express";
import {
  searchRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  suggestMenu,
  suggestWeeklyMenuEndpoint,
  similarRecipes,
  swapSingleMeal,
} from "../controllers/recipeController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", searchRecipes);
router.get("/:id/similar", similarRecipes);
router.get("/:id", getRecipeById);
router.post("/suggest", suggestMenu);
router.post("/suggest-weekly", suggestWeeklyMenuEndpoint);
router.post("/swap-single-meal", swapSingleMeal);

// Admin routes - protected
router.use(protect, admin);
router.route("/").post(createRecipe);

router.route("/:id").put(updateRecipe).delete(deleteRecipe);

export default router;
