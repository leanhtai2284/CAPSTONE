import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tên cửa hàng là bắt buộc"],
      trim: true,
      maxlength: [120, "Tên cửa hàng không được quá 120 ký tự"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Mô tả không được quá 1000 ký tự"],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [30, "Số điện thoại không được quá 30 ký tự"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [240, "Địa chỉ không được quá 240 ký tự"],
    },
    openingHours: {
      type: String,
      trim: true,
      maxlength: [200, "Giờ mở cửa không được quá 200 ký tự"],
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    bannerUrl: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

storeSchema.index({ owner: 1, createdAt: -1 });
storeSchema.index({ location: "2dsphere" });

const Store = mongoose.model("Store", storeSchema);

export default Store;
