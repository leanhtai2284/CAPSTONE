import User from "../../models/User.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // Update user offline status and last logout time
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastLogout: new Date(),
    });
  }

  res.status(200).json({
    success: true,
    message: "Đăng xuất thành công",
  });
});