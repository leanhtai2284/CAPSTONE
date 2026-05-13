import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const storeCreateSchema = Joi.object({
  name: Joi.string().trim().max(120).required(),
  description: Joi.string().trim().max(1000).allow(""),
  phone: Joi.string().trim().max(30).allow(""),
  address: Joi.string().trim().max(240).allow(""),
  openingHours: Joi.string().trim().max(200).allow(""),
  logoUrl: Joi.string().trim().allow(""),
  bannerUrl: Joi.string().trim().allow(""),
  isActive: Joi.boolean(),
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  location: Joi.object({
    type: Joi.string().valid("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }).optional(),
}).and("lat", "lng");

export const storeUpdateSchema = Joi.object({
  name: Joi.string().trim().max(120),
  description: Joi.string().trim().max(1000).allow(""),
  phone: Joi.string().trim().max(30).allow(""),
  address: Joi.string().trim().max(240).allow(""),
  openingHours: Joi.string().trim().max(200).allow(""),
  logoUrl: Joi.string().trim().allow(""),
  bannerUrl: Joi.string().trim().allow(""),
  isActive: Joi.boolean(),
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  location: Joi.object({
    type: Joi.string().valid("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }).optional(),
})
  .and("lat", "lng")
  .min(1);

export const storeQuerySchema = Joi.object({
  q: Joi.string().trim().max(120),
  isActive: Joi.boolean(),
  owner: objectId,
});

export const productCreateSchema = Joi.object({
  name: Joi.string().trim().max(160).required(),
  description: Joi.string().trim().max(2000).allow(""),
  images: Joi.array().items(Joi.string().trim()).default([]),
  category: Joi.string().trim().max(80).allow(""),
  brand: Joi.string().trim().max(80).allow(""),
  productType: Joi.string().valid("ingredient", "meal"),
  unit: Joi.string().valid(
    "g",
    "kg",
    "ml",
    "l",
    "pcs",
    "pack",
    "box",
    "bottle",
    "can",
    "bag",
  ),
  sku: Joi.string().trim().max(80).allow(""),
  price: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0),
  currency: Joi.string().trim().max(10),
  stock: Joi.number().min(0).required(),
  isAvailable: Joi.boolean(),
  tags: Joi.array().items(Joi.string().trim()).default([]),
});

export const productUpdateSchema = Joi.object({
  name: Joi.string().trim().max(160),
  description: Joi.string().trim().max(2000).allow(""),
  images: Joi.array().items(Joi.string().trim()),
  category: Joi.string().trim().max(80).allow(""),
  brand: Joi.string().trim().max(80).allow(""),
  productType: Joi.string().valid("ingredient", "meal"),
  unit: Joi.string().valid(
    "g",
    "kg",
    "ml",
    "l",
    "pcs",
    "pack",
    "box",
    "bottle",
    "can",
    "bag",
  ),
  sku: Joi.string().trim().max(80).allow(""),
  price: Joi.number().min(0),
  salePrice: Joi.number().min(0),
  currency: Joi.string().trim().max(10),
  stock: Joi.number().min(0),
  isAvailable: Joi.boolean(),
  tags: Joi.array().items(Joi.string().trim()),
}).min(1);

export const productQuerySchema = Joi.object({
  storeId: objectId,
  q: Joi.string().trim().max(120),
  category: Joi.string().trim().max(80),
  productType: Joi.string().valid("ingredient", "meal"),
  isAvailable: Joi.boolean(),
});

export const orderCreateSchema = Joi.object({
  storeId: objectId.required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: objectId.required(),
        quantity: Joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required(),
  shipping: Joi.object({
    recipientName: Joi.string().trim().max(120).required(),
    phone: Joi.string().trim().max(30).required(),
    address: Joi.string().trim().max(240).required(),
    notes: Joi.string().trim().max(500).allow(""),
  }).required(),
  payment: Joi.object({
    method: Joi.string().trim().max(50),
    status: Joi.string().valid("pending", "paid", "failed", "refunded"),
    transactionId: Joi.string().trim().max(120),
  }).optional(),
  deliveryFee: Joi.number().min(0),
  discount: Joi.number().min(0),
});

export const orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "paid", "shipping", "delivered", "cancelled")
    .required(),
});

export const paymentStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "paid", "failed", "refunded")
    .required(),
  method: Joi.string().trim().max(50),
  transactionId: Joi.string().trim().max(120),
});

export const revenueQuerySchema = Joi.object({
  period: Joi.string().valid("day", "week").default("day"),
  days: Joi.number().integer().min(1).max(90).default(14),
});

export const objectIdParamSchema = Joi.object({
  id: objectId.required(),
});

export const storeIdParamSchema = Joi.object({
  storeId: objectId.required(),
});
