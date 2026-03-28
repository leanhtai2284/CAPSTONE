import mongoose from "mongoose";
import asyncHandler from "../middlewares/asyncHandler.js";
import Pantry from "../models/Pantry.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Chuan hóa mốc thời gian về 00:00 để tránh lệch ngày do giờ/phú
function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Giới hạn số ngày sắp hết hạn để query ổn định không nhập quá lớn
function clampExpiringDays(daysInput) {
  const parsed = Number(daysInput);
  if (!Number.isFinite(parsed)) return 3;
  return Math.min(30, Math.max(1, Math.floor(parsed)));
}

// Tính trạng thái động từ expiryDate, không lưu cứng status vào DB
function getStatusAndDays(expiryDate, todayStart, expiringDays) {
  const expiryStart = new Date(expiryDate);
  expiryStart.setHours(0, 0, 0, 0);
  const daysToExpire = Math.round((expiryStart - todayStart) / MS_PER_DAY);

  if (daysToExpire < 0) {
    return { status: "expired", daysToExpire };
  }
  if (daysToExpire <= expiringDays) {
    return { status: "expiring", daysToExpire };
  }
  return { status: "fresh", daysToExpire };
}

// Build filter MongoDB theo status để giảm dữ liệu phải xử lý phía app
function buildStatusFilter(status, todayStart, expiringDays) {
  const endExpiring = new Date(todayStart);
  endExpiring.setDate(endExpiring.getDate() + expiringDays);
  endExpiring.setHours(23, 59, 59, 999);

  if (status === "expired") {
    return { expiryDate: { $lt: todayStart } };
  }
  if (status === "expiring") {
    return { expiryDate: { $gte: todayStart, $lte: endExpiring } };
  }
  if (status === "fresh") {
    return { expiryDate: { $gt: endExpiring } };
  }
  return {};
}

export const createPantryItem = asyncHandler(async (req, res) => {
  const { name, quantity, unit, storageLocation, expiryDate, category, openedDate, notes } =
    req.body;

  if (!name || quantity == null || !unit || !storageLocation || !expiryDate) {
    return res.status(400).json({
      success: false,
      message:
        "Vui lòng nhập đầy đủ các trường bắt buộc: name, quantity, unit, storageLocation, expiryDate",
    });
  }

  const pantryItem = await Pantry.create({
    user: req.user._id,
    name,
    quantity,
    unit,
    storageLocation,
    expiryDate,
    category,
    openedDate,
    notes,
  });

  return res.status(201).json({
    success: true,
    message: "Tạo pantry item thành công",
    data: pantryItem,
  });
});

export const getPantryItems = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
  const skip = (page - 1) * limit;

  const expiringDays = clampExpiringDays(req.query.days);
  const status = (req.query.status || "").toLowerCase();
  const q = (req.query.q || "").trim();
  const category = (req.query.category || "").trim();
  const storageLocation = (req.query.storageLocation || "").trim();

  const todayStart = getTodayStart();

  const filter = {
    user: req.user._id,
    ...buildStatusFilter(status, todayStart, expiringDays),
  };

  if (q) {
    filter.name = { $regex: q, $options: "i" };
  }
  if (category) {
    filter.category = category;
  }
  if (storageLocation) {
    filter.storageLocation = storageLocation;
  }

  const [items, total] = await Promise.all([
    Pantry.find(filter).sort({ expiryDate: 1, createdAt: -1 }).skip(skip).limit(limit),
    Pantry.countDocuments(filter),
  ]);

  // Bổ sung status/daysToExpire khi trả response để frontend render trực tiếp
  const data = items.map((item) => {
    const { status: computedStatus, daysToExpire } = getStatusAndDays(
      item.expiryDate,
      todayStart,
      expiringDays
    );
    return {
      ...item.toObject(),
      status: computedStatus,
      daysToExpire,
    };
  });

  return res.status(200).json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      expiringDays,
      status: status || "all",
    },
  });
});

export const getPantryItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }

  const item = await Pantry.findOne({ _id: id, user: req.user._id });
  if (!item) {
    return res.status(404).json({ success: false, message: "Không tìm thấy pantry item" });
  }

  const expiringDays = clampExpiringDays(req.query.days);
  const todayStart = getTodayStart();
  const { status, daysToExpire } = getStatusAndDays(item.expiryDate, todayStart, expiringDays);

  return res.status(200).json({
    success: true,
    data: { ...item.toObject(), status, daysToExpire },
  });
});

export const updatePantryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }

  // Chỉ cho phép user cập nhật item của chính mình
  const updated = await Pantry.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return res.status(404).json({ success: false, message: "Không tìm thấy pantry item" });
  }

  return res.status(200).json({
    success: true,
    message: "Cập nhật pantry item thành công",
    data: updated,
  });
});

export const deletePantryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }

  // Chỉ cho phép user xóa item của chính mình.
  const deleted = await Pantry.findOneAndDelete({ _id: id, user: req.user._id });
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Không tìm thấy pantry item" });
  }

  return res.status(200).json({
    success: true,
    message: "Xóa pantry item thành công",
  });
});
