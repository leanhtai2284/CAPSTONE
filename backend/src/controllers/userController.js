import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy người dùng",
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy người dùng",
    });
  }

  // Cập nhật thông tin cơ bản
  user.name = req.body.name || user.name;

  // Cập nhật preferences
  if (req.body.preferences) {
    user.preferences = {
      ...user.preferences.toObject(),
      ...req.body.preferences,
    };
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: "Cập nhật hồ sơ thành công",
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      preferences: updatedUser.preferences,
    },
  });
});

// @desc    Get personalized meal recommendations
// @route   GET /api/users/recommendations
// @access  Private
export const getRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user || !user.preferences) {
    return res.status(404).json({
      success: false,
      message: "Chưa có thông tin cá nhân hóa. Vui lòng cập nhật hồ sơ.",
    });
  }

  const { region, diet, avoidedFoods } = user.preferences;

  // Build query based on user preferences
  const query = {};

  // Lọc theo vùng miền
  if (region) {
    query.region = region;
  }

  // Lọc theo chế độ ăn
  if (diet && diet !== "normal") {
    if (diet === "keto") query.diet_tags = "keto";
    else if (diet === "vegan" || diet === "vegetarian")
      query.diet_tags = "vegetarian";
    else if (diet === "clean") query.diet_tags = "eatclean";
  }

  console.log("🔍 Personalized query:", query);

  // Lấy món ăn phù hợp
  const recommendations = await Recipe.find(query).limit(20).lean();

  res.json({
    success: true,
    data: recommendations,
    preferences: user.preferences,
    count: recommendations.length,
  });
});
