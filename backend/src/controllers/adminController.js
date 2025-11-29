import User from "../models/User.js";
import mongoose from "mongoose";
import { createNotification } from "./notificationController.js";

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      filter.role = role;
    }

    // Get users (exclude password)
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách người dùng",
      error: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin người dùng",
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email này đã được sử dụng",
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && ["user", "admin", "moderator"].includes(role)) {
      updateData.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Không thể cập nhật người dùng",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    // Prevent deleting yourself
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể xóa chính mình",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Prevent deleting other admins (optional - you can remove this if you want)
    if (user.role === "admin" && req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Không thể xóa tài khoản admin khác",
      });
    }

    await User.findByIdAndDelete(id);

    await createNotification({
      user: null,
      audience: "admin",
      title: "Xóa người dùng",
      message: `Admin ${req.user?.email || ""} đã xóa tài khoản ${user.email}`,
      type: "user_activity",
      metadata: {
        deletedUserId: user._id,
        email: user.email,
      },
    });

    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa người dùng",
      error: error.message,
    });
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    if (!role || !["user", "admin", "moderator"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role không hợp lệ. Phải là: user, admin, hoặc moderator",
      });
    }

    // Prevent changing your own role
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể thay đổi role của chính mình",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    // Thông báo cho chính user được đổi role
    await createNotification({
      user: updatedUser._id,
      audience: "user",
      title: "Cập nhật quyền truy cập",
      message: `Quyền truy cập của bạn đã được cập nhật thành: ${role}`,
      type: "user_activity",
      metadata: {
        role,
      },
    });

    // Thông báo chung cho admin khác (nếu cần theo dõi thay đổi quyền)
    await createNotification({
      user: null,
      audience: "admin",
      title: "Đã thay đổi vai trò người dùng",
      message: `Admin ${req.user?.email || ""} đã cập nhật role của người dùng ${updatedUser.email} thành ${role}`,
      type: "user_activity",
      metadata: {
        targetUserId: updatedUser._id,
        email: updatedUser.email,
        role,
      },
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật role thành công",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Không thể cập nhật role",
      error: error.message,
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private/Admin
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalModerators = await User.countDocuments({ role: "moderator" });
    const totalRegularUsers = await User.countDocuments({ role: "user" });

    // Users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalModerators,
        totalRegularUsers,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê người dùng",
      error: error.message,
    });
  }
};

