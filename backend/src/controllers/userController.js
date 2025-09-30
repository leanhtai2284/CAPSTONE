import User from "../models/User.js";
import asyncHandler from "../middlewares/asyncHandler.js";

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
