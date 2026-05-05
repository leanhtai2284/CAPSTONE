import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    goal: {
      type: String,
      enum: ["healthy", "fitness", "weight_loss", "muscle_gain", "balanced"],
      default: "healthy",
    },
    privacy: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    members: [groupMemberSchema],
  },
  { timestamps: true },
);

groupSchema.index({ owner: 1, createdAt: -1 });
groupSchema.index({ "members.user": 1 });

groupSchema.pre("save", function (next) {
  if (!this.createdBy) {
    this.createdBy = this.owner;
  }
  next();
});

const Group = mongoose.model("Group", groupSchema);
export default Group;
