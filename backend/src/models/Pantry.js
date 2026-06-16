import mongoose from "mongoose";

const pantrySchema = new mongoose.Schema(
  {
    //Mỗi pantry item thuộc về đúng một user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tên thực phẩm là bắt buộc"],
      trim: true,
      maxlength: [120, "Tên thực phẩm không được quá 120 ký tự"],
    },
    quantity: {
      type: Number,
      required: [true, "Số lượng là bắt buộc"],
      min: [0.0001, "Số lượng phải lớn hơn 0"],
    },
    unit: {
      type: String,
      required: [true, "Đơn vị là bắt buộc"],
      enum: ["g", "kg", "ml", "l", "pcs", "pack", "bottle", "can"],
    },
    storageLocation: {
      type: String,
      required: [true, "Nơi bảo quản là bắt buộc"],
      enum: ["fridge", "freezer", "pantry", "room"],
    },
    //expiryDate là dữ liệu gốc để tính fresh/expiring/expired
    expiryDate: {
      type: Date,
      required: [true, "Ngày hết hạn là bắt buộc"],
      index: true,
    },
    category: {
      type: String,
      enum: [
        "protein",
        "vegetable",
        "fruit",
        "grain",
        "dairy",
        "condiment",
        "beverage",
        "other",
      ],
      default: "other",
    },
    //openedDate là optional, dùng cho đồ đóng gói khi cần mở rộng logic sau này
    openedDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Ghi chú không được quá 500 ký tự"],
    },
  },
  { timestamps: true }
);

pantrySchema.index({ user: 1, expiryDate: 1 });

const Pantry = mongoose.model("Pantry", pantrySchema);

export default Pantry;
