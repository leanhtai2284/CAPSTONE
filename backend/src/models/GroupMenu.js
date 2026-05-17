import mongoose from "mongoose";

const groupMenuMealSchema = new mongoose.Schema(
  {
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    suggestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    votes: {
      type: Number,
      default: 0,
    },
    votedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    note: {
      type: String,
      maxlength: 200,
      default: "",
    },
  },
  { _id: false },
);

const groupMenuSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      unique: true,
    },
    meals: [groupMenuMealSchema],
    checkedIngredients: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

groupMenuSchema.index({ group: 1 });

groupMenuSchema.index({ "meals.meal": 1 });

const GroupMenu = mongoose.model("GroupMenu", groupMenuSchema);
export default GroupMenu;
