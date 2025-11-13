import User from "../models/User.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import mongoose from "mongoose";

//Tao dang ky moi
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

    // Tạo token giống như khi login để client có thể được auto-auth sau khi đăng ký
    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
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

// Tạo JWT token
export const generateToken = (id, role) => {
  // include role in token payload for convenience
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Kiểm tra email và password đã được nhập
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập email và mật khẩu",
    });
  }

  // Tìm user theo email
  const user = await User.findOne({ email });
  console.log("Found user:", user);

  if (user) {
    const isMatch = await user.matchPassword(password);
    console.log("Password comparison:", {
      inputPassword: password,
      storedHashedPassword: user.password,
      isMatch: isMatch,
    });
  }

  // Kiểm tra user tồn tại và mật khẩu đúng
  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Email hoặc mật khẩu không đúng",
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Đăng xuất thành công",
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Email không tồn tại trong hệ thống",
    });
  }

  // Tạo reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token và lưu vào database
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Token có hiệu lực 15 phút

  await user.save();

  // Tạo URL reset password
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Nội dung email
  const html = `
    <h1>Yêu cầu đặt lại mật khẩu</h1>
    <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
    <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
    <a href="${resetUrl}" target="_blank">Đặt lại mật khẩu</a>
    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
    <p>Link sẽ hết hạn sau 15 phút.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Yêu cầu đặt lại mật khẩu",
      html,
    });

    res.status(200).json({
      success: true,
      message: "Email khôi phục mật khẩu đã được gửi",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(500).json({
      success: false,
      message: "Email không thể gửi được",
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // Hash token để so sánh với token trong database
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Tìm user với token hợp lệ và chưa hết hạn
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }

  // Set mật khẩu mới
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Mật khẩu đã được cập nhật",
  });
});
