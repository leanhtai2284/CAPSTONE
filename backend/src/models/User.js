import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên người dùng"],
      trim: true,
      maxLength: [50, "Tên người dùng không được vượt quá 50 ký tự"],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      trim: true,
      maxLength: [100, "Email không được vượt quá 100 ký tự"],
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minLength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
    // Role-based access control
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // user cap nhap thong tin ca nhan
    preferences: {
      region: {
        type: String,
        enum: ["Bắc", "Trung", "Nam"],
        default: "Nam",
      },
      familySize: {
        type: Number,
        default: 4,
        min: 1,
        max: 20,
      },
      activityLevel: {
        type: String,
        enum: ["low", "moderate", "high"],
        default: "moderate",
      },
      goal: {
        type: String,
        enum: ["lose", "maintain", "gain"],
        default: "maintain",
      },
      budget: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      diet: {
        type: String,
        enum: ["normal", "clean", "keto", "vegan", "vegetarian"],
        default: "normal",
      },
      likedFoods: {
        type: [String],
        default: [],
      },
      avoidedFoods: {
        type: [String],
        default: [],
      },
    },
  },
  { timestamps: true }
);

// Mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Phương thức so sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Export the model
const User = mongoose.model("User", userSchema);
export default User;
