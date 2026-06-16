import mongoose from "mongoose";

const groupInviteSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: Date,
  },
  { timestamps: true },
);

groupInviteSchema.index({ group: 1, email: 1, status: 1 });

groupInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const GroupInvite = mongoose.model("GroupInvite", groupInviteSchema);
export default GroupInvite;
