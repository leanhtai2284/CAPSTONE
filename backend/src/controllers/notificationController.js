import Notification from "../models/Notification.js";

// Get notifications for current user (or admin)
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role || "user";

    const audienceFilter = ["both", role === "admin" ? "admin" : "user"];

    const filter = {
      $or: [
        { user: userId },
        { user: null, audience: { $in: audienceFilter } },
      ],
    };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("getMyNotifications error", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể lấy thông báo" });
  }
};

// Mark one or many notifications as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { ids } = req.body; // array of notification IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Danh sách thông báo không hợp lệ" });
    }

    await Notification.updateMany(
      {
        _id: { $in: ids },
        $or: [{ user: userId }, { user: null }],
      },
      { $set: { read: true } }
    );

    return res
      .status(200)
      .json({ success: true, message: "Đã cập nhật trạng thái thông báo" });
  } catch (error) {
    console.error("markAsRead error", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể cập nhật thông báo" });
  }
};

// Delete one or many notifications of current user
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { ids } = req.body; // array of notification IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Danh sách thông báo không hợp lệ" });
    }

    await Notification.deleteMany({
      _id: { $in: ids },
      $or: [{ user: userId }, { user: null }],
    });

    return res
      .status(200)
      .json({ success: true, message: "Đã xóa thông báo" });
  } catch (error) {
    console.error("deleteNotifications error", error);
    return res
      .status(500)
      .json({ success: false, message: "Không thể xóa thông báo" });
  }
};

// Helper để các controller khác có thể tạo thông báo một cách an toàn
export const createNotification = async (payload) => {
  try {
    const notification = await Notification.create(payload);
    return notification;
  } catch (error) {
    console.error("createNotification error", error);
    // Không throw để tránh làm hỏng flow chính của business logic
    return null;
  }
};

export default {
  getMyNotifications,
  markAsRead,
  deleteNotifications,
  createNotification,
};
