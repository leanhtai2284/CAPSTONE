import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

export async function findRecipeById(recipeId) {
  if (!recipeId) return null;

  const candidateIds = [{ id: recipeId }];
  if (mongoose.isValidObjectId(recipeId)) {
    candidateIds.push({ _id: recipeId });
  }

  return Recipe.findOne({ $or: candidateIds }).select("name_vi").lean();
}
