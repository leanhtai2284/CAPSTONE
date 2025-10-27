import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema(
  {
    calories: { type: Number, required: true },
    protein_g: Number,
    carbs_g: Number,
    fat_g: Number,
    fiber_g: Number,
    sodium_mg: Number,
    sugar_g: Number,
  },
  { _id: false }
);

const priceSchema = new mongoose.Schema(
  {
    min: Number,
    max: Number,
    currency: { type: String, default: "VND" },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    name_vi: { type: String, required: true, index: "text" },
    region: {
      type: String,
      enum: ["Bắc", "Trung", "Nam"],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["main", "soup", "salad", "snack", "dessert", "drink"],
      index: true,
    },
    meal_types: [{ type: String, enum: ["breakfast", "lunch", "dinner"] }],
    prep_time_min: Number,
    cook_time_min: Number,
    difficulty: { type: String, enum: ["easy", "medium", "hard"], index: true },

    nutrition: nutritionSchema,
    price_estimate: priceSchema,

    diet_tags: [{ type: String, index: true }],
    allergens: [{ type: String, index: true }],

    taste_profile: [{ type: String }],
    spice_level: { type: Number, default: 0 },
    servings: { type: Number, default: 1 },

    image_url: String,
    description: String,

    ingredients: [{ type: String }],
    utensils: [{ type: String }],
    steps: [{ type: String }],

    suitable_for: [{ type: String }],
    avoid_for: [{ type: String }],
  },
  { timestamps: true }
);

recipeSchema.index({ name_vi: "text", name_en: "text", description: "text" });

export default mongoose.model("Recipe", recipeSchema);
