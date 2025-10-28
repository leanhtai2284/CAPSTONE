import express from "express";
import {
  searchRecipes,
  getRecipeById,
  suggestMenu,
  similarRecipes,
} from "../controllers/recipeController.js";
const router = express.Router();

router.get("/", searchRecipes);
router.get("/:id/similar", similarRecipes);
router.get("/:id", getRecipeById);
router.post("/suggest", suggestMenu);

export default router;
