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
  generateShoppingList,
} from "../controllers/recipeController.js";
import { createUGC } from "../controllers/ugcController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
import ugcUpload from "../middlewares/ugcUploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", searchRecipes);
router.get("/:id/similar", similarRecipes);
router.get("/:id", getRecipeById);
router.post("/suggest", suggestMenu);
router.post("/suggest-weekly", suggestWeeklyMenuEndpoint);
router.post("/swap-single-meal", swapSingleMeal);
router.post("/shopping-list", generateShoppingList);

// UGC submit (logged-in users)
router.post(
  "/ugc",
  protect,
  (req, res, next) => {
    ugcUpload.single("cooking_video")(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, message: err.message || "Upload failed" });
      }
      next();
    });
  },
  createUGC,
);

// Admin routes - protected
router.use(protect, admin);

// Admin recipe creation with video upload
router.post("/", (req, res, next) => {
  ugcUpload.single("cooking_video")(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: err.message || "Upload failed" });
    }
    next();
  });
}, createRecipe);

// Check if recipe ID exists
router.get("/check-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Recipe = require("../models/Recipe.js");
    const existingRecipe = await Recipe.findOne({ id });
    res.json({ exists: !!existingRecipe });
  } catch (error) {
    res.status(500).json({ error: "Internal error" });
  }
});

router.route("/:id").put(
  (req, res, next) => {
    ugcUpload.single("cooking_video")(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, message: err.message || "Upload failed" });
      }
      next();
    });
  },
  updateRecipe
).delete(deleteRecipe);

export default router;
