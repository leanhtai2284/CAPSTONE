import DailyMenu from "../models/DailyMenu.js";
import { createNotification } from "./notificationController.js";

// POST /api/menus/daily
export const createDailyMenu = async (req, res) => {
  try {
    const { dayIndex, dayName, date, meals } = req.body;

    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Không có thực đơn để lưu" });
    }

    const menu = await DailyMenu.create({
      user: req.user._id,
      dayIndex,
      dayName,
      date: date ? new Date(date) : new Date(),
      meals,
    });

    // Tạo thông báo cho user về thực đơn mới lưu
    await createNotification({
      user: req.user._id,
      audience: "user",
      title: "Đã lưu thực đơn mới",
      message: `Thực đơn cho ngày ${dayName || "hôm nay"} đã được lưu thành công`,
      type: "menu",
      metadata: {
        menuId: menu._id,
        dayIndex,
        dayName,
      },
    });

    res.status(201).json({ success: true, data: menu });
  } catch (err) {
    console.error("Error createDailyMenu:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/menus/daily
export const getDailyMenus = async (req, res) => {
  try {
    const menus = await DailyMenu.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, data: menus });
  } catch (err) {
    console.error("Error getDailyMenus:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// DELETE /api/menus/daily/:id
export const deleteDailyMenu = async (req, res) => {
  try {
    const menu = await DailyMenu.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!menu) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thực đơn" });
    }

    await createNotification({
      user: req.user._id,
      audience: "user",
      title: "Đã xóa thực đơn",
      message: `Thực đơn cho ngày ${menu.dayName || ""} đã được xóa`,
      type: "menu",
      metadata: {
        menuId: menu._id,
        dayIndex: menu.dayIndex,
        dayName: menu.dayName,
      },
    });

    res.json({ success: true, message: "Đã xóa thực đơn" });
  } catch (err) {
    console.error("Error deleteDailyMenu:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
