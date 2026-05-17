import asyncHandler from "../middlewares/asyncHandler.js";
import Store from "../models/Store.js";
import MarketProduct from "../models/MarketProduct.js";

const canManageStore = (user, store) =>
  user?.role === "admin" || store?.owner?.toString() === user?._id?.toString();

const pickAllowedFields = (payload, allowedFields) =>
  Object.fromEntries(
    Object.entries(payload || {}).filter(([key]) =>
      allowedFields.includes(key),
    ),
  );

export const createProduct = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const store = await Store.findById(storeId);

  if (!store) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy cửa hàng" });
  }

  if (!canManageStore(req.user, store)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thêm sản phẩm cho cửa hàng này",
    });
  }

  const { name, price, stock } = req.body || {};

  if (!name || !String(name).trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Tên sản phẩm là bắt buộc" });
  }

  if (price == null || Number(price) < 0) {
    return res
      .status(400)
      .json({ success: false, message: "Giá bán không hợp lệ" });
  }

  if (stock == null || Number(stock) < 0) {
    return res
      .status(400)
      .json({ success: false, message: "Tồn kho không hợp lệ" });
  }

  const allowedFields = [
    "name",
    "description",
    "images",
    "category",
    "brand",
    "productType",
    "unit",
    "sku",
    "price",
    "salePrice",
    "currency",
    "stock",
    "isAvailable",
    "tags",
  ];

  const payload = pickAllowedFields(req.body, allowedFields);
  payload.name = String(name).trim();
  payload.store = store._id;

  const product = await MarketProduct.create(payload);

  return res.status(201).json({ success: true, data: product });
});

export const getProducts = asyncHandler(async (req, res) => {
  const { storeId, q, category, productType, isAvailable } = req.query || {};
  const filter = {};

  if (storeId) {
    filter.store = storeId;
  }

  if (category) {
    filter.category = category;
  }

  if (productType) {
    filter.productType = productType;
  }

  if (isAvailable !== undefined) {
    filter.isAvailable = isAvailable === "true" || isAvailable === true;
  }

  if (q) {
    filter.$text = { $search: q };
  }

  const products = await MarketProduct.find(filter)
    .sort({ createdAt: -1 })
<<<<<<< HEAD
    .populate("store", "name owner");
=======
    .populate("store", "name location");
>>>>>>> ef384aeb14ed06f7970e8a2ba0a85b97de41ee3e

  return res.status(200).json({ success: true, data: products });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await MarketProduct.findById(req.params.id).populate(
    "store",
    "name location",
  );

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy sản phẩm" });
  }

  return res.status(200).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await MarketProduct.findById(req.params.id);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy sản phẩm" });
  }

  const store = await Store.findById(product.store);
  if (!store || !canManageStore(req.user, store)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền cập nhật sản phẩm này",
    });
  }

  const allowedFields = [
    "name",
    "description",
    "images",
    "category",
    "brand",
    "productType",
    "unit",
    "sku",
    "price",
    "salePrice",
    "currency",
    "stock",
    "isAvailable",
    "tags",
  ];

  const updates = pickAllowedFields(req.body, allowedFields);
  Object.assign(product, updates);

  await product.save();

  return res.status(200).json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await MarketProduct.findById(req.params.id);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy sản phẩm" });
  }

  const store = await Store.findById(product.store);
  if (!store || !canManageStore(req.user, store)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền xóa sản phẩm này",
    });
  }

  await product.deleteOne();

  return res.status(200).json({ success: true, message: "Đã xóa sản phẩm" });
});

export const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Không có file ảnh" });
  }

  const url = `/uploads/market/${req.file.filename}`;

  return res.status(200).json({ success: true, data: { url } });
});

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
