import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // system-wide or role-based notifications may not target a single user
    },
    // "user" | "admin" | "both"
    audience: {
      type: String,
      enum: ["user", "admin", "both"],
      default: "user",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "menu",
        "report",
        "security",
        "system",
        "user_activity",
        "recipe",
      ],
      default: "system",
    },
    // optional metadata such as recipeId, menuId, etc.
    metadata: {
      type: Object,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
