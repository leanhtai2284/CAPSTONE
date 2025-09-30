import mongoose from "mongoose"; // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Vui lòng nhập tên người dùng"],
    trim: true,
    maxLength: [50, "Tên người dùng không được vượt quá 50 ký tự"],
  },
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
});

//Export the model
const User = mongoose.model("User", userSchema);
export default User;
