import Feedback from "../models/Feedback.js";
import { createNotification } from "./notificationController.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const createFeedback = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { type, message } = req.body;

  if (!message || !message.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Nội dung phản hồi không được để trống" });
  }

  const feedback = await Feedback.create({
    user: userId || null,
    type: type || "suggestion",
    message: message.trim(),
  });

  const typeLabelMap = {
    suggestion: "Góp ý",
    bug: "Báo lỗi",
    feature: "Tính năng mới",
  };

  const label = typeLabelMap[feedback.type] || "Phản hồi";

  await createNotification({
    user: null,
    audience: "admin",
    title: `[${label}] Phản hồi mới từ người dùng`,
    message: message.length > 80 ? message.slice(0, 77) + "..." : message,
    type: "user_activity",
    metadata: {
      feedbackId: feedback._id,
      userId: userId || null,
      type: feedback.type,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Đã ghi nhận phản hồi của bạn",
    data: feedback,
  });
});

// Admin: lấy danh sách feedback với optional filter theo type/status/date
export const getAllFeedback = asyncHandler(async (req, res) => {
  const { type, status, from, to } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  if (from || to) {
    filter.createdAt = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        filter.createdAt.$gte = fromDate;
      }
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        // set tới cuối ngày
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }
    if (Object.keys(filter.createdAt).length === 0) {
      delete filter.createdAt;
    }
  }

  const feedbacks = await Feedback.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, data: feedbacks });
});

// Admin: lấy chi tiết một feedback
export const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!feedback) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy phản hồi" });
  }

  return res.status(200).json({ success: true, data: feedback });
});

// Admin: cập nhật trạng thái / phản hồi cho feedback
export const updateFeedback = asyncHandler(async (req, res) => {
  const { status, adminResponse } = req.body;

  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy phản hồi" });
  }

  if (status) {
    feedback.status = status;
  }

  if (typeof adminResponse === "string") {
    feedback.adminResponse = adminResponse.trim();
    feedback.respondedAt = new Date();
  }

  await feedback.save();

  // Nếu feedback có user, gửi thông báo ngược lại cho user khi admin phản hồi
  if (feedback.user) {
    const typeLabelMap = {
      suggestion: "Góp ý",
      bug: "Báo lỗi",
      feature: "Tính năng mới",
    };

    const label = typeLabelMap[feedback.type] || "Phản hồi";

    await createNotification({
      user: feedback.user,
      audience: "user",
      title: `[${label}] Phản hồi từ admin`,
      message:
        feedback.adminResponse && feedback.adminResponse.length > 80
          ? feedback.adminResponse.slice(0, 77) + "..."
          : feedback.adminResponse ||
            "Admin đã cập nhật trạng thái phản hồi của bạn",
      type: "user_activity",
      metadata: {
        feedbackId: feedback._id,
        status: feedback.status,
      },
    });
  }

  return res.status(200).json({ success: true, data: feedback });
});

// Admin: xoá một feedback
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy phản hồi" });
  }

  await feedback.deleteOne();

  return res
    .status(200)
    .json({ success: true, message: "Đã xoá phản hồi", data: { id: req.params.id } });
});

export default {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
};
