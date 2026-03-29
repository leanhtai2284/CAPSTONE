import mongoose from "mongoose";
import asyncHandler from "../middlewares/asyncHandler.js";
import Pantry from "../models/Pantry.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const VIETNAM_TZ = "Asia/Ho_Chi_Minh";
const STATUS_VALUES = ["expired", "expiring", "fresh"];
const CATEGORY_VALUES = Pantry.schema.path("category").enumValues;
const STORAGE_VALUES = Pantry.schema.path("storageLocation").enumValues;
const UPDATABLE_FIELDS = [
  "name",
  "quantity",
  "unit",
  "storageLocation",
  "expiryDate",
  "category",
  "openedDate",
  "notes",
];

function toPositiveInt(value, fallback, { min = 1, max = 100 } = {}) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function parseDateInput(input) {
  if (input === undefined) {
    return { provided: false };
  }

  if (input === null || input === "") {
    return { provided: true, valid: true, value: null };
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return { provided: true, valid: false, value: null };
  }

  return { provided: true, valid: true, value: parsed };
}

function pickAllowedFields(payload, allowedFields) {
  return Object.fromEntries(
    Object.entries(payload || {}).filter(([key]) => allowedFields.includes(key))
  );
}

// Day index tính theo VN (UTC+7), tránh lệch ngày khi server chạy timezone khác.
function getVietnamDayIndex(dateInput = new Date()) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return Math.floor((date.getTime() + VN_OFFSET_MS) / MS_PER_DAY);
}

function getUtcStartFromVietnamDayIndex(dayIndex) {
  return new Date(dayIndex * MS_PER_DAY - VN_OFFSET_MS);
}

function getVietnamBoundaries(todayVietnamDayIndex, expiringDays) {
  const startOfTodayUtc = getUtcStartFromVietnamDayIndex(todayVietnamDayIndex);
  const startAfterExpiringUtc = getUtcStartFromVietnamDayIndex(
    todayVietnamDayIndex + expiringDays + 1
  );

  return { startOfTodayUtc, startAfterExpiringUtc };
}

function getTodayVietnamDayIndex() {
  return getVietnamDayIndex(new Date());
}

// Giới hạn số ngày sắp hết hạn để query ổn định không nhập quá lớn
function clampExpiringDays(daysInput) {
  const parsed = Number(daysInput);
  if (!Number.isFinite(parsed)) return 3;
  return Math.min(30, Math.max(1, Math.floor(parsed)));
}

// Tính trạng thái động từ expiryDate theo ngày VN, không lưu cứng status vào DB.
function getStatusAndDays(expiryDate, todayVietnamDayIndex, expiringDays) {
  const expiryVietnamDayIndex = getVietnamDayIndex(expiryDate);
  const daysToExpire = expiryVietnamDayIndex - todayVietnamDayIndex;

  if (daysToExpire < 0) {
    return { status: "expired", daysToExpire };
  }
  if (daysToExpire <= expiringDays) {
    return { status: "expiring", daysToExpire };
  }
  return { status: "fresh", daysToExpire };
}

// Build filter MongoDB theo status để giảm dữ liệu phải xử lý phía app
function buildStatusFilter(status, todayVietnamDayIndex, expiringDays) {
  const { startOfTodayUtc, startAfterExpiringUtc } = getVietnamBoundaries(
    todayVietnamDayIndex,
    expiringDays
  );

  if (status === "expired") {
    return { expiryDate: { $lt: startOfTodayUtc } };
  }
  if (status === "expiring") {
    return { expiryDate: { $gte: startOfTodayUtc, $lt: startAfterExpiringUtc } };
  }
  if (status === "fresh") {
    return { expiryDate: { $gte: startAfterExpiringUtc } };
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

  const parsedExpiryDate = parseDateInput(expiryDate);
  if (!parsedExpiryDate.provided || !parsedExpiryDate.valid || !parsedExpiryDate.value) {
    return res.status(400).json({
      success: false,
      message: "expiryDate không hợp lệ",
    });
  }

  const parsedOpenedDate = parseDateInput(openedDate);
  if (parsedOpenedDate.provided && !parsedOpenedDate.valid) {
    return res.status(400).json({
      success: false,
      message: "openedDate không hợp lệ",
    });
  }

  const pantryItem = await Pantry.create({
    user: req.user._id,
    name,
    quantity,
    unit,
    storageLocation,
    expiryDate: parsedExpiryDate.value,
    category,
    ...(parsedOpenedDate.provided ? { openedDate: parsedOpenedDate.value } : {}),
    notes,
  });

  return res.status(201).json({
    success: true,
    message: "Tạo pantry item thành công",
    data: pantryItem,
  });
});

export const getPantryItems = asyncHandler(async (req, res) => {
  const page = toPositiveInt(req.query.page, 1, { min: 1, max: 100000 });
  const limit = toPositiveInt(req.query.limit, 20, { min: 1, max: 100 });
  const skip = (page - 1) * limit;

  const expiringDays = clampExpiringDays(req.query.days);
  const status = (req.query.status || "").toLowerCase().trim();
  const q = (req.query.q || "").trim();
  const category = (req.query.category || "").trim();
  const storageLocation = (req.query.storageLocation || "").trim();

  if (status && !STATUS_VALUES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `status không hợp lệ. Chỉ nhận: ${STATUS_VALUES.join(", ")}`,
    });
  }

  if (category && !CATEGORY_VALUES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `category không hợp lệ. Chỉ nhận: ${CATEGORY_VALUES.join(", ")}`,
    });
  }

  if (storageLocation && !STORAGE_VALUES.includes(storageLocation)) {
    return res.status(400).json({
      success: false,
      message: `storageLocation không hợp lệ. Chỉ nhận: ${STORAGE_VALUES.join(", ")}`,
    });
  }

  const todayVietnamDayIndex = getTodayVietnamDayIndex();

  const filter = {
    user: req.user._id,
    ...buildStatusFilter(status, todayVietnamDayIndex, expiringDays),
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
      todayVietnamDayIndex,
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
      timezone: VIETNAM_TZ,
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
  const todayVietnamDayIndex = getTodayVietnamDayIndex();
  const { status, daysToExpire } = getStatusAndDays(
    item.expiryDate,
    todayVietnamDayIndex,
    expiringDays
  );

  return res.status(200).json({
    success: true,
    data: { ...item.toObject(), status, daysToExpire, timezone: VIETNAM_TZ },
  });
});

export const getPantrySummary = asyncHandler(async (req, res) => {
  const expiringDays = clampExpiringDays(req.query.days);
  const todayVietnamDayIndex = getTodayVietnamDayIndex();
  const { startOfTodayUtc, startAfterExpiringUtc } = getVietnamBoundaries(
    todayVietnamDayIndex,
    expiringDays
  );

  const baseFilter = { user: req.user._id };

  const [total, expired, expiring, fresh] = await Promise.all([
    Pantry.countDocuments(baseFilter),
    Pantry.countDocuments({ ...baseFilter, expiryDate: { $lt: startOfTodayUtc } }),
    Pantry.countDocuments({
      ...baseFilter,
      expiryDate: { $gte: startOfTodayUtc, $lt: startAfterExpiringUtc },
    }),
    Pantry.countDocuments({ ...baseFilter, expiryDate: { $gte: startAfterExpiringUtc } }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      total,
      expired,
      expiring,
      fresh,
    },
    meta: {
      expiringDays,
      timezone: VIETNAM_TZ,
    },
  });
});

export const updatePantryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }

  const disallowedFields = Object.keys(req.body || {}).filter(
    (key) => !UPDATABLE_FIELDS.includes(key)
  );
  if (disallowedFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Không thể cập nhật field: ${disallowedFields.join(", ")}`,
    });
  }

  const updatePayload = pickAllowedFields(req.body, UPDATABLE_FIELDS);
  if (Object.keys(updatePayload).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Không có dữ liệu hợp lệ để cập nhật",
    });
  }

  if (updatePayload.category && !CATEGORY_VALUES.includes(updatePayload.category)) {
    return res.status(400).json({
      success: false,
      message: `category không hợp lệ. Chỉ nhận: ${CATEGORY_VALUES.join(", ")}`,
    });
  }

  if (
    updatePayload.storageLocation &&
    !STORAGE_VALUES.includes(updatePayload.storageLocation)
  ) {
    return res.status(400).json({
      success: false,
      message: `storageLocation không hợp lệ. Chỉ nhận: ${STORAGE_VALUES.join(", ")}`,
    });
  }

  const parsedExpiryDate = parseDateInput(updatePayload.expiryDate);
  if (parsedExpiryDate.provided) {
    if (!parsedExpiryDate.valid || !parsedExpiryDate.value) {
      return res.status(400).json({ success: false, message: "expiryDate không hợp lệ" });
    }
    updatePayload.expiryDate = parsedExpiryDate.value;
  }

  const parsedOpenedDate = parseDateInput(updatePayload.openedDate);
  if (parsedOpenedDate.provided) {
    if (!parsedOpenedDate.valid) {
      return res.status(400).json({ success: false, message: "openedDate không hợp lệ" });
    }
    updatePayload.openedDate = parsedOpenedDate.value;
  }

  // Chỉ cho phép user cập nhật item của chính mình
  const updated = await Pantry.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { $set: updatePayload },
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
