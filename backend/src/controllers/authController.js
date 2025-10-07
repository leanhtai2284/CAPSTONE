import User from "../models/User.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import jwt from "jsonwebtoken";

export const Register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng điền tất cả các trường",
    });
  }
  const response = await User.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    message: "Đăng ký thành công",
    response,
  });
});

// Tạo JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
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
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Email hoặc mật khẩu không đúng",
    });
  }
});
