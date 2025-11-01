import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import NutritionFact from "../models/NutritionFact.js";

async function connect() {
  await mongoose.connect(process.env.MONGO_URI, {});
  console.log("Connected Mongo");
}

async function run() {
  await connect();

  const recipes = await Recipe.find({}).lean();
  console.log(`Found ${recipes.length} recipes`);

  let upserted = 0;
  for (const r of recipes) {
    const nut = r.nutrition || {};
    const doc = {
      recipeRef: r._id,
      recipeId: r.id || undefined,
      calories: Number(nut.calories || 0),
      protein_g: Number(nut.protein_g || 0),
      carbs_g: Number(nut.carbs_g || 0),
      fat_g: Number(nut.fat_g || 0),
      fiber_g: Number(nut.fiber_g || 0),
      sodium_mg: Number(nut.sodium_mg || 0),
      sugar_g: Number(nut.sugar_g || 0),
      source: "migrated_from_recipe",
    };

    try {
      await NutritionFact.findOneAndUpdate(
        { $or: [{ recipeRef: r._id }, { recipeId: r.id }] },
        doc,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      upserted++;
    } catch (e) {
      console.warn(`Failed upsert for recipe ${r._id}: ${e.message || e}`);
    }
  }

  console.log(`Done. Upserted: ${upserted}`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
