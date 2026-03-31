import User from "../models/User.js";

// @desc    Update offline status for inactive users
// @route   POST /api/admin/users/update-activity
// @access  Private/Admin
export const updateActivityStatus = async (req, res) => {
  try {
    // Find users who have been online but inactive for more than 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    
    const result = await User.updateMany(
      {
        isOnline: true,
        lastLogin: { $lt: thirtySecondsAgo }
      },
      {
        isOnline: false,
        lastLogout: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} inactive users to offline status`,
      data: {
        updatedCount: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái hoạt động",
      error: error.message,
    });
  }
};
