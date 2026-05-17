import mongoose from "mongoose";
import asyncHandler from "../middlewares/asyncHandler.js";
import Store from "../models/Store.js";
import MarketProduct from "../models/MarketProduct.js";
import MarketOrder from "../models/MarketOrder.js";
import Pantry from "../models/Pantry.js";

const mapToPantryCategory = (marketCategory) => {
  if (!marketCategory) return "other";
  const cat = marketCategory.toLowerCase().trim();
  
  if (cat.includes("thịt") || cat.includes("cá") || cat.includes("bò") || cat.includes("heo") || cat.includes("protein") || cat.includes("gà") || cat.includes("hải sản")) {
    return "protein";
  }
  if (cat.includes("rau") || cat.includes("vegetable") || cat.includes("củ")) {
    return "vegetable";
  }
  if (cat.includes("quả") || cat.includes("trái") || cat.includes("fruit")) {
    return "fruit";
  }
  if (cat.includes("sữa") || cat.includes("dairy") || cat.includes("bơ") || cat.includes("cheese")) {
    return "dairy";
  }
  if (cat.includes("nước") || cat.includes("beverage") || cat.includes("uống") || cat.includes("bia") || cat.includes("ngọt")) {
    return "beverage";
  }
  if (cat.includes("gia vị") || cat.includes("condiment") || cat.includes("mắm") || cat.includes("muối") || cat.includes("đường")) {
    return "condiment";
  }
  if (cat.includes("gạo") || cat.includes("grain") || cat.includes("mì") || cat.includes("bột")) {
    return "grain";
  }
  
  const allowed = ["protein", "vegetable", "fruit", "grain", "dairy", "condiment", "beverage", "other"];
  if (allowed.includes(cat)) return cat;
  
  return "other";
};

const mapToPantryUnit = (marketUnit) => {
  const allowed = ["g", "kg", "ml", "l", "pcs", "pack", "bottle", "can"];
  if (!marketUnit) return "pcs";
  const u = marketUnit.toLowerCase().trim();
  if (allowed.includes(u)) return u;
  if (u === "box") return "pack";
  if (u === "bag") return "pack";
  return "pcs";
};

const toPositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const canManageStore = (user, store) =>
  user?.role === "admin" || store?.owner?.toString() === user?._id?.toString();

const canAccessOrder = (user, order) => {
  if (user?.role === "admin") return true;
  if (order?.user?.toString() === user?._id?.toString()) return true;
  if (order?.store?.owner?.toString() === user?._id?.toString()) return true;
  return false;
};

const normalizeItems = (items = []) => {
  const itemMap = new Map();
  const invalidItems = [];

  for (const item of items) {
    const productId = item?.productId || item?.product || item?.id;
    const quantity = toPositiveInt(item?.quantity);

    if (!productId || !mongoose.isValidObjectId(productId) || !quantity) {
      invalidItems.push(item);
      continue;
    }

    const key = String(productId);
    const current = itemMap.get(key) || 0;
    itemMap.set(key, current + quantity);
  }

  const normalizedItems = Array.from(itemMap.entries()).map(
    ([productId, quantity]) => ({ productId, quantity }),
  );

  return { normalizedItems, invalidItems };
};

export const createOrder = asyncHandler(async (req, res) => {
  const { storeId, items, shipping, payment, deliveryFee, discount } =
    req.body || {};

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    return res
      .status(400)
      .json({ success: false, message: "Cửa hàng không hợp lệ" });
  }

  const store = await Store.findById(storeId);
  if (!store) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy cửa hàng" });
  }

  const { normalizedItems, invalidItems } = normalizeItems(items);
  if (invalidItems.length > 0 || normalizedItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Danh sách sản phẩm không hợp lệ",
      data: { invalidItems },
    });
  }

  if (!shipping?.recipientName || !shipping?.phone || !shipping?.address) {
    return res.status(400).json({
      success: false,
      message: "Thông tin giao hàng là bắt buộc",
    });
  }

  const productIds = normalizedItems.map((item) => item.productId);
  const products = await MarketProduct.find({
    _id: { $in: productIds },
    store: storeId,
    isAvailable: true,
  });

  if (products.length !== normalizedItems.length) {
    return res.status(400).json({
      success: false,
      message: "Một số sản phẩm không tồn tại hoặc không khả dụng",
    });
  }

  const productMap = new Map();
  for (const product of products) {
    productMap.set(product._id.toString(), product);
  }

  const stockIssues = [];
  const orderItems = [];
  let itemsTotal = 0;

  for (const item of normalizedItems) {
    const product = productMap.get(String(item.productId));
    const quantity = item.quantity;
    const unitPrice =
      product.salePrice != null && product.salePrice >= 0
        ? product.salePrice
        : product.price;

    if (product.stock < quantity) {
      stockIssues.push({
        productId: product._id,
        name: product.name,
        available: product.stock,
        requested: quantity,
      });
      continue;
    }

    const lineTotal = unitPrice * quantity;
    itemsTotal += lineTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      unit: product.unit,
      unitPrice,
      quantity,
      lineTotal,
    });
  }

  if (stockIssues.length > 0) {
    return res.status(409).json({
      success: false,
      message: "Tồn kho không đủ để đặt hàng",
      data: { stockIssues },
    });
  }

  const deliveryValue = Number(deliveryFee) || 0;
  const discountValue = Number(discount) || 0;
  const total = Math.max(0, itemsTotal + deliveryValue - discountValue);

  const paymentStatus = payment?.status === "paid" ? "paid" : "pending";
  const orderStatus = paymentStatus === "paid" ? "paid" : "pending";

  const stockUpdates = [];

  for (const item of orderItems) {
    const updated = await MarketProduct.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true },
    );

    if (!updated) {
      for (const rollback of stockUpdates) {
        await MarketProduct.updateOne(
          { _id: rollback.product },
          { $inc: { stock: rollback.quantity } },
        );
      }

      return res.status(409).json({
        success: false,
        message: "Tồn kho thay đổi, vui lòng thử lại",
      });
    }

    stockUpdates.push({ product: item.product, quantity: item.quantity });
  }

  const order = await MarketOrder.create({
    user: req.user._id,
    store: storeId,
    items: orderItems,
    itemsTotal,
    deliveryFee: deliveryValue,
    discount: discountValue,
    total,
    currency: "VND",
    status: orderStatus,
    payment: {
      method: payment?.method,
      status: paymentStatus,
      transactionId: payment?.transactionId,
      paidAt: paymentStatus === "paid" ? new Date() : undefined,
    },
    shipping: {
      recipientName: shipping.recipientName,
      phone: shipping.phone,
      address: shipping.address,
      notes: shipping.notes,
    },
  });

  return res.status(201).json({ success: true, data: order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await MarketOrder.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("store", "name")
    .populate("items.product", "name");

  return res.status(200).json({ success: true, data: orders });
});

export const getStoreOrders = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { status, dateFrom, dateTo } = req.query || {};

  const store = await Store.findById(storeId);

  if (!store) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy cửa hàng" });
  }

  if (!canManageStore(req.user, store)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền xem đơn hàng của cửa hàng này",
    });
  }

  const filter = { store: storeId };

  // Filter by status (comma-separated or single)
  if (status && status !== "all") {
    const statuses = status.split(",").map((s) => s.trim()).filter(Boolean);
    if (statuses.length === 1) {
      filter.status = statuses[0];
    } else if (statuses.length > 1) {
      filter.status = { $in: statuses };
    }
  }

  // Filter by date range
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      filter.createdAt.$gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = to;
    }
  }

  const orders = await MarketOrder.find(filter)
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("items.product", "name");

  return res.status(200).json({ success: true, data: orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await MarketOrder.findById(req.params.id)
    .populate("store", "name owner")
    .populate("user", "name email")
    .populate("items.product", "name");

  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy đơn hàng" });
  }

  if (!canAccessOrder(req.user, order)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền xem đơn hàng này",
    });
  }

  return res.status(200).json({ success: true, data: order });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  const allowedStatuses = [
    "pending",
    "paid",
    "shipping",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Trạng thái không hợp lệ" });
  }

  const order = await MarketOrder.findById(req.params.id)
    .populate("store", "owner")
    .populate("items.product");

  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy đơn hàng" });
  }

  if (!canManageStore(req.user, order.store)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền cập nhật đơn hàng này",
    });
  }

  if (order.status === "cancelled" && status !== "cancelled") {
    return res.status(400).json({ success: false, message: "Không thể thay đổi trạng thái của đơn hàng đã hủy" });
  }

  const previousStatus = order.status;
  order.status = status;

  if (status === "paid" && order.payment?.status !== "paid") {
    order.payment.status = "paid";
    order.payment.paidAt = new Date();
  }

  // HOÀN TRẢ TỒN KHO NẾU HỦY ĐƠN HÀNG
  if (status === "cancelled" && previousStatus !== "cancelled") {
    for (const item of order.items) {
      const productId = item.product?._id || item.product;
      await MarketProduct.findByIdAndUpdate(productId, {
        $inc: { stock: item.quantity }
      });
    }
  }

  // AUTO-PANTRY SYNC KHI ĐƠN HÀNG ĐÃ GIAO THÀNH CÔNG
  if (status === "delivered" && previousStatus !== "delivered") {
    for (const item of order.items) {
      const prod = item.product; // Đã populated
      const category = mapToPantryCategory(prod?.category);
      const unit = mapToPantryUnit(item.unit || prod?.unit);
      
      // Kiểm tra xem có món trùng tên chưa hết hạn không để cộng dồn
      const existingPantryItem = await Pantry.findOne({
        user: order.user,
        name: item.name,
        unit: unit,
        expiryDate: { $gt: new Date() }
      });
      
      if (existingPantryItem) {
        existingPantryItem.quantity += item.quantity;
        await existingPantryItem.save();
      } else {
        // Tạo mới Pantry item
        const expiryDays = category === "protein" ? 3 : category === "vegetable" || category === "fruit" ? 5 : 14;
        const expiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
        
        await Pantry.create({
          user: order.user,
          name: item.name,
          quantity: item.quantity,
          unit: unit,
          storageLocation: (category === "protein" || category === "dairy") ? "freezer" : (category === "vegetable" || category === "fruit") ? "fridge" : "pantry",
          expiryDate: expiryDate,
          category: category,
          notes: `Tự động nhập từ đơn hàng Market #${order._id.toString().slice(-6)}`
        });
      }
    }
  }

  await order.save();

  return res.status(200).json({ success: true, data: order });
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, transactionId, method } = req.body || {};
  const allowedStatuses = ["pending", "paid", "failed", "refunded"];

  if (!allowedStatuses.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Trạng thái thanh toán không hợp lệ" });
  }

  const order = await MarketOrder.findById(req.params.id).populate(
    "store",
    "owner",
  );

  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy đơn hàng" });
  }

  if (!canAccessOrder(req.user, order)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền cập nhật thanh toán đơn hàng này",
    });
  }

  const previousPaymentStatus = order.payment.status;
  order.payment.status = status;
  if (method) order.payment.method = method;
  if (transactionId) order.payment.transactionId = transactionId;
  
  if (status === "paid") {
    order.payment.paidAt = new Date();
    if (order.status === "pending") {
      order.status = "paid";
    }
  } else if ((status === "failed" || status === "refunded") && order.status !== "cancelled") {
    // HOÀN TRẢ TỒN KHO NẾU THANH TOÁN THẤT BẠI
    for (const item of order.items) {
      const productId = item.product?._id || item.product;
      await MarketProduct.findByIdAndUpdate(productId, {
        $inc: { stock: item.quantity }
      });
    }
    order.status = "cancelled";
  }

  await order.save();

  return res.status(200).json({ success: true, data: order });
});

export const getStoreRevenue = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { period, days } = req.query || {};

  const store = await Store.findById(storeId);
  if (!store) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy cửa hàng" });
  }

  if (!canManageStore(req.user, store)) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền xem doanh thu của cửa hàng này",
    });
  }

  const now = new Date();
  const rangeDays = Number(days) || 14;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (rangeDays - 1));
  startDate.setHours(0, 0, 0, 0);

  const matchStage = {
    store: store._id,
    status: { $in: ["paid", "shipping", "delivered"] },
    createdAt: { $gte: startDate, $lte: now },
  };

  let groupStage = null;
  let projectStage = null;

  if (period === "week") {
    groupStage = {
      _id: {
        isoWeek: { $isoWeek: "$createdAt" },
        isoYear: { $isoWeekYear: "$createdAt" },
      },
      total: { $sum: "$total" },
      orders: { $sum: 1 },
    };
    projectStage = {
      _id: 0,
      label: {
        $concat: [
          { $toString: "$_id.isoYear" },
          "-W",
          { $toString: "$_id.isoWeek" },
        ],
      },
      total: 1,
      orders: 1,
    };
  } else {
    groupStage = {
      _id: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$createdAt",
          timezone: "Asia/Ho_Chi_Minh",
        },
      },
      total: { $sum: "$total" },
      orders: { $sum: 1 },
    };
    projectStage = {
      _id: 0,
      label: "$_id",
      total: 1,
      orders: 1,
    };
  }

  const data = await MarketOrder.aggregate([
    { $match: matchStage },
    { $group: groupStage },
    { $project: projectStage },
    { $sort: { label: 1 } },
  ]);

  return res.status(200).json({
    success: true,
    data: {
      period: period === "week" ? "week" : "day",
      startDate,
      endDate: now,
      points: data,
    },
  });
});

export const uploadReceipt = asyncHandler(async (req, res) => {
  const order = await MarketOrder.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
  }

  // Chú ý: Chỉ người mua mới được up bill
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Bạn không có quyền thực hiện" });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Vui lòng chọn ảnh biên lai" });
  }

  // Path trả về từ upload middleware (thường là /uploads/...)
  const imageUrl = `/uploads/${req.file.filename}`;

  order.payment.proofOfPayment = imageUrl;
  order.payment.method = "vietqr";
  await order.save();

  return res.status(200).json({ success: true, data: order });
});

export default {
  createOrder,
  getMyOrders,
  getStoreOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getStoreRevenue,
  uploadReceipt,
};
