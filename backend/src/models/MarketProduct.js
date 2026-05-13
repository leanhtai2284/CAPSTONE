import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
      trim: true,
      maxlength: [160, "Tên sản phẩm không được quá 160 ký tự"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Mô tả không được quá 2000 ký tự"],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [80, "Danh mục không được quá 80 ký tự"],
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [80, "Thương hiệu không được quá 80 ký tự"],
    },
    productType: {
      type: String,
      enum: ["ingredient", "meal"],
      default: "ingredient",
    },
    unit: {
      type: String,
      enum: [
        "g",
        "kg",
        "ml",
        "l",
        "pcs",
        "pack",
        "box",
        "bottle",
        "can",
        "bag",
      ],
      default: "pcs",
    },
    sku: {
      type: String,
      trim: true,
      maxlength: [80, "SKU không được quá 80 ký tự"],
    },
    price: {
      type: Number,
      required: [true, "Giá bán là bắt buộc"],
      min: [0, "Giá bán phải >= 0"],
    },
    salePrice: {
      type: Number,
      min: [0, "Giá khuyến mãi phải >= 0"],
    },
    currency: {
      type: String,
      default: "VND",
    },
    stock: {
      type: Number,
      required: [true, "Tồn kho là bắt buộc"],
      min: [0, "Tồn kho phải >= 0"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

productSchema.index({ store: 1, createdAt: -1 });
productSchema.index({ name: "text", category: "text", brand: "text" });

const MarketProduct = mongoose.model("MarketProduct", productSchema);

export default MarketProduct;
