import mongoose from "mongoose";

const dailyMenuSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dayIndex: { type: Number }, // 0-6
    dayName: { type: String }, // "Thứ 2", "Chủ nhật", ...
    date: { type: Date }, // Ngày thực đơn
    // Lưu nguyên cấu trúc meals mà FE đang dùng
    meals: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DailyMenu", dailyMenuSchema);
