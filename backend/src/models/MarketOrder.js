import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketProduct",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const marketOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    itemsTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "VND",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    payment: {
      method: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: {
        type: String,
        trim: true,
      },
      paidAt: {
        type: Date,
      },
    },
    shipping: {
      recipientName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [500, "Ghi chú không được quá 500 ký tự"],
      },
    },
  },
  { timestamps: true },
);

marketOrderSchema.index({ store: 1, createdAt: -1 });
marketOrderSchema.index({ user: 1, createdAt: -1 });

const MarketOrder = mongoose.model("MarketOrder", marketOrderSchema);

export default MarketOrder;
