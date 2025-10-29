import express from "express";
import { listNutritionFacts, getNutritionById, getNutritionByRecipeId } from "../controllers/nutritionController.js";

const router = express.Router();

// list & filter
router.get("/", listNutritionFacts);

// get by recipe id (explicit)
router.get("/recipe/:recipeId", getNutritionByRecipeId);

// get by nutrition doc id
router.get("/:id", getNutritionById);

export default router;
