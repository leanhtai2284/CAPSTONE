import mongoose from "mongoose";

const NutritionFactSchema = new mongoose.Schema(
  {
    // Reference to recipe._id if available
    recipeRef: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", index: true },
    // The recipe custom id field (string) used in existing seed/data
    recipeId: { type: String, index: true },

    calories: { type: Number, required: true, default: 0 },
    protein_g: { type: Number, default: 0 },
    carbs_g: { type: Number, default: 0 },
    fat_g: { type: Number, default: 0 },
    fiber_g: { type: Number, default: 0 },
    sodium_mg: { type: Number, default: 0 },
    sugar_g: { type: Number, default: 0 },

    // optional meta
    source: { type: String },
  },
  { timestamps: true }
);

NutritionFactSchema.index({ calories: 1 });

export default mongoose.model("NutritionFact", NutritionFactSchema);
