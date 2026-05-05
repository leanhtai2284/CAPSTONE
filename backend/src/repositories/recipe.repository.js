import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findRecipeById(recipeId) {
  if (!recipeId) return null;

  const candidateIds = [{ id: recipeId }];
  if (mongoose.isValidObjectId(recipeId)) {
    candidateIds.push({ _id: recipeId });
  }

  return Recipe.findOne({ $or: candidateIds })
    .select("name_vi diet_tags category")
    .lean();
}

export async function findRecipeByName(recipeName) {
  const safeName = String(recipeName || "").trim();
  if (!safeName) return null;

  const escaped = escapeRegex(safeName);

  return Recipe.findOne({ name_vi: new RegExp(`^${escaped}$`, "i") })
    .select("name_vi diet_tags category")
    .lean();
}
