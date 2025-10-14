import User from "../models/User.js";

import asyncHandler from "../middlewares/asyncHandler.js";

export const Register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng điền tất cả các trường",
    });
  }

  // Kiểm tra mật khẩu xác nhận
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Mật khẩu xác nhận không khớp",
    });
  }

  // Kiểm tra độ dài mật khẩu
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    });
  }

  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được sử dụng, vui lòng dùng email khác",
      });
    }

    // Tạo user mới
    const user = await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Đăng ký thất bại",
      error: error.message,
    });
  }
});
