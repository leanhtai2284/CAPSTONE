import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  storeCreateSchema,
  storeUpdateSchema,
  storeQuerySchema,
  storeIdParamSchema,
  productCreateSchema,
  productUpdateSchema,
  productQuerySchema,
  orderCreateSchema,
  orderStatusSchema,
  paymentStatusSchema,
  revenueQuerySchema,
  objectIdParamSchema,
} from "../middlewares/marketValidation.js";
import upload from "../middlewares/marketUploadMiddleware.js";
import {
  createStore,
  getStores,
  getMyStores,
  getStoreById,
  updateStore,
} from "../controllers/marketStoreController.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/marketProductController.js";
import {
  createOrder,
  getMyOrders,
  getStoreOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getStoreRevenue,
} from "../controllers/marketOrderController.js";
import { uploadProductImage } from "../controllers/marketProductController.js";

const router = express.Router();

// Stores
router.get("/stores", validate(storeQuerySchema, "query"), getStores);
router.get(
  "/stores/:id",
  validate(objectIdParamSchema, "params"),
  getStoreById,
);
router.post(
  "/stores",
  protect,
  authorizeRoles("store_owner", "admin"),
  validate(storeCreateSchema),
  createStore,
);
router.get(
  "/stores/my",
  protect,
  authorizeRoles("store_owner", "admin"),
  getMyStores,
);
router.put(
  "/stores/:id",
  protect,
  authorizeRoles("store_owner", "admin"),
  validate(objectIdParamSchema, "params"),
  validate(storeUpdateSchema),
  updateStore,
);

// Products
router.get("/products", validate(productQuerySchema, "query"), getProducts);
router.get(
  "/products/:id",
  validate(objectIdParamSchema, "params"),
  getProductById,
);
router.post(
  "/stores/:storeId/products",
  protect,
  authorizeRoles("store_owner", "admin"),
  validate(storeIdParamSchema, "params"),
  validate(productCreateSchema),
  createProduct,
);
router.put(
  "/products/:id",
  protect,
  authorizeRoles("store_owner", "admin"),
  validate(objectIdParamSchema, "params"),
  validate(productUpdateSchema),
  updateProduct,
);
router.delete(
  "/products/:id",
  protect,
  authorizeRoles("store_owner", "admin"),
  validate(objectIdParamSchema, "params"),
  deleteProduct,
);
router.post(
  "/products/upload",
  protect,
  authorizeRoles("store_owner", "admin"),
  upload.single("image"),
  uploadProductImage,
);

// Orders
router.post("/orders", protect, validate(orderCreateSchema), createOrder);
router.get("/orders/my", protect, getMyOrders);
router.get(
  "/orders/store/:storeId",
  protect,
  authorizeRoles("store_owner", "admin"),
  validate(storeIdParamSchema, "params"),
  getStoreOrders,
);
router.get(
  "/orders/store/:storeId/revenue",
  protect,
  authorizeRoles("store_owner", "admin"),
  validate(storeIdParamSchema, "params"),
  validate(revenueQuerySchema, "query"),
  getStoreRevenue,
);
router.get(
  "/orders/:id",
  protect,
  validate(objectIdParamSchema, "params"),
  getOrderById,
);
router.patch(
  "/orders/:id/status",
  protect,
  authorizeRoles("store_owner", "admin"),
  validate(objectIdParamSchema, "params"),
  validate(orderStatusSchema),
  updateOrderStatus,
);
router.patch(
  "/orders/:id/payment",
  protect,
  validate(objectIdParamSchema, "params"),
  validate(paymentStatusSchema),
  updatePaymentStatus,
);

export default router;
