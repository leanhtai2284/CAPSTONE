import mongoose from "mongoose";
import asyncHandler from "../middlewares/asyncHandler.js";
import Store from "../models/Store.js";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildLocation = (payload = {}) => {
  const lat = toNumber(payload.lat ?? payload.latitude);
  const lng = toNumber(payload.lng ?? payload.longitude);

  if (lat != null && lng != null) {
    return { type: "Point", coordinates: [lng, lat] };
  }

  if (
    payload.location &&
    Array.isArray(payload.location.coordinates) &&
    payload.location.coordinates.length === 2
  ) {
    const [lngValue, latValue] = payload.location.coordinates;
    if (Number.isFinite(lngValue) && Number.isFinite(latValue)) {
      return { type: "Point", coordinates: [lngValue, latValue] };
    }
  }

  return null;
};

const canManageStore = (user, store) =>
  user?.role === "admin" || store?.owner?.toString() === user?._id?.toString();

// ─── Đăng ký trở thành Store Owner ──────────────────────────────────────────
// Bất kỳ user đã đăng nhập đều có thể gọi endpoint này.
// BE sẽ tạo Store với trạng thái isActive: false và chờ Admin duyệt.
export const registerAsStoreOwner = asyncHandler(async (req, res) => {
  const { name, description, phone, address, openingHours } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, message: "Tên cửa hàng là bắt buộc" });
  }

  // Kiểm tra xem user đã có store nào chưa
  const existingStore = await Store.findOne({ owner: req.user._id });
  if (existingStore) {
    return res.status(400).json({ success: false, message: "Bạn đã gửi đơn đăng ký hoặc đã có cửa hàng rồi" });
  }

  const location = buildLocation(req.body) || undefined;

  const store = await Store.create({
    owner: req.user._id,
    name: String(name).trim(),
    description: description?.trim(),
    phone: phone?.trim(),
    address: address?.trim(),
    openingHours: openingHours?.trim(),
    location,
    isActive: false, // Chờ duyệt
  });

  return res.status(201).json({
    success: true,
    message: "Đăng ký thành công! Đơn đăng ký của bạn đang chờ Ban Quản Trị xét duyệt.",
    data: {
      store,
      newRole: req.user.role, // Giữ nguyên role cũ
    },
  });
});

export const createStore = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    phone,
    address,
    openingHours,
    logoUrl,
    bannerUrl,
  } = req.body || {};

  if (!name || !String(name).trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Tên cửa hàng là bắt buộc" });
  }

  const location = buildLocation(req.body) || undefined;

  const store = await Store.create({
    owner: req.user._id,
    name: String(name).trim(),
    description: description?.trim(),
    phone: phone?.trim(),
    address: address?.trim(),
    openingHours: openingHours?.trim(),
    logoUrl: logoUrl?.trim(),
    bannerUrl: bannerUrl?.trim(),
    location,
  });

  return res.status(201).json({ success: true, data: store });
});


export const getStores = asyncHandler(async (req, res) => {
  const { q, isActive, owner } = req.query || {};
  const filter = {};

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true" || isActive === true;
  }

  if (owner && mongoose.isValidObjectId(owner)) {
    filter.owner = owner;
  }

  const stores = await Store.find(filter).sort({ createdAt: -1 });

  return res.status(200).json({ success: true, data: stores });
});

export const getMyStores = asyncHandler(async (req, res) => {
  const stores = await Store.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  return res.status(200).json({ success: true, data: stores });
});

export const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy cửa hàng" });
  }

  return res.status(200).json({ success: true, data: store });
});

export const updateStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy cửa hàng" });
  }

  if (!canManageStore(req.user, store)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền cập nhật cửa hàng này",
    });
  }

  const allowedFields = [
    "name",
    "description",
    "phone",
    "address",
    "openingHours",
    "logoUrl",
    "bannerUrl",
    "isActive",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      store[field] = req.body[field];
    }
  }

  const nextLocation = buildLocation(req.body);
  if (nextLocation) {
    store.location = nextLocation;
  }

  await store.save();

  return res.status(200).json({ success: true, data: store });
});

export default {
  createStore,
  getStores,
  getMyStores,
  getStoreById,
  updateStore,
};
