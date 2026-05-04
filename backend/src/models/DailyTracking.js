import mongoose from "mongoose";

const dailyTrackingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Ngày tracking (chỉ lưu phần ngày, không có giờ)
    date: {
      type: Date,
      required: true,
      index: true,
    },
    // Danh sách các món đã ăn trong ngày
    meals_eaten: [
      {
        recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
        name_vi: { type: String },
        eaten_at: { type: Date, default: Date.now },
        nutrition: {
          calories: { type: Number, default: 0 },
          protein_g: { type: Number, default: 0 },
          carbs_g: { type: Number, default: 0 },
          fat_g: { type: Number, default: 0 },
          fiber_g: { type: Number, default: 0 },
          sodium_mg: { type: Number, default: 0 },
          sugar_g: { type: Number, default: 0 },
        },
      },
    ],
    // Tổng cộng cả ngày (tự tính lại mỗi lần thêm món)
    daily_totals: {
      calories: { type: Number, default: 0 },
      protein_g: { type: Number, default: 0 },
      carbs_g: { type: Number, default: 0 },
      fat_g: { type: Number, default: 0 },
      fiber_g: { type: Number, default: 0 },
      sodium_mg: { type: Number, default: 0 },
      sugar_g: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Index để tìm tracking theo user + ngày
dailyTrackingSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyTracking", dailyTrackingSchema);
