import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Id món ăn (recipe) – lưu dạng string để linh hoạt (có thể là _id hoặc id bên FE)
    recipeId: {
      type: String,
      required: true,
    },
    // Lưu luôn toàn bộ object meal để FE render nhanh
    meal: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

// Mỗi user chỉ được lưu 1 lần cho mỗi món
favoriteSchema.index({ user: 1, recipeId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
