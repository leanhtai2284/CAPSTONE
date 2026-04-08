import mongoose from "mongoose";
import asyncHandler from "../middlewares/asyncHandler.js";
import Pantry from "../models/Pantry.js";
import Recipe from "../models/Recipe.js";
import PANTRY_MATCHING_CONFIG from "../config/pantryMatching.config.js";
import { runPantryExpiryNotificationJob } from "../services/pantryExpiryNotificationService.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const VIETNAM_TZ = "Asia/Ho_Chi_Minh";
const STATUS_VALUES = ["expired", "expiring", "fresh"];
const CATEGORY_VALUES = Pantry.schema.path("category").enumValues;
const STORAGE_VALUES = Pantry.schema.path("storageLocation").enumValues;
const UNIT_VALUES = Pantry.schema.path("unit").enumValues;
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
const MASS_UNITS = new Set(PANTRY_MATCHING_CONFIG?.unitFamilies?.mass || ["g", "kg"]);
const VOLUME_UNITS = new Set(
  PANTRY_MATCHING_CONFIG?.unitFamilies?.volume || ["ml", "l"]
);
const COUNT_UNITS = new Set(
  PANTRY_MATCHING_CONFIG?.unitFamilies?.count || ["pcs", "pack", "bottle", "can"]
);
const SPOON_TO_ML = {
  tbsp: Number(PANTRY_MATCHING_CONFIG?.spoonToMl?.tbsp) || 15,
  tsp: Number(PANTRY_MATCHING_CONFIG?.spoonToMl?.tsp) || 5,
};
const EMPTY_CONTAINER_ESTIMATES = {
  bottleMl: null,
  canMl: null,
  packG: null,
  canG: null,
};
const CATEGORY_CONTAINER_ESTIMATES =
  PANTRY_MATCHING_CONFIG?.categoryContainerEstimates || {
    other: EMPTY_CONTAINER_ESTIMATES,
  };
const UNIT_ALIAS_MAP = PANTRY_MATCHING_CONFIG?.unitAliasMap || {};
const NAME_STOP_WORDS = new Set(PANTRY_MATCHING_CONFIG?.nameStopWords || []);

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

function normalizeObjectIdList(idsInput) {
  if (!Array.isArray(idsInput)) {
    return { validIds: [], invalidIds: [] };
  }

  const seen = new Set();
  const validIds = [];
  const invalidIds = [];

  for (const rawId of idsInput) {
    const id = String(rawId || "").trim();
    if (!id || !mongoose.isValidObjectId(id)) {
      invalidIds.push(rawId);
      continue;
    }
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    validIds.push(id);
  }

  return { validIds, invalidIds };
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeFoodName(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeFoodName(value) {
  return normalizeFoodName(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !NAME_STOP_WORDS.has(token));
}

function buildBigramSet(value) {
  const compact = normalizeFoodName(value).replace(/\s+/g, "");
  if (compact.length < 2) {
    return new Set(compact ? [compact] : []);
  }

  const grams = new Set();
  for (let i = 0; i < compact.length - 1; i += 1) {
    grams.add(compact.slice(i, i + 2));
  }
  return grams;
}

function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

function normalizeUnit(value) {
  const key = normalizeText(value).replace(/\./g, "");
  return UNIT_ALIAS_MAP[key] || key;
}

function getUnitFamily(unit) {
  if (MASS_UNITS.has(unit)) return "mass";
  if (VOLUME_UNITS.has(unit)) return "volume";
  if (unit === "tbsp" || unit === "tsp") return "volume";
  if (COUNT_UNITS.has(unit)) return "count";
  return "other";
}

function areUnitsCompatible(requiredUnit, pantryUnit) {
  if (!requiredUnit || !pantryUnit) return false;
  const requiredFamily = getUnitFamily(requiredUnit);
  const pantryFamily = getUnitFamily(pantryUnit);

  if (requiredFamily !== pantryFamily) return false;
  if (requiredFamily === "count" || requiredFamily === "other") {
    return requiredUnit === pantryUnit;
  }
  return true;
}

function convertAmountToBase(amount, unit) {
  if (!Number.isFinite(amount)) return null;
  if (unit === "kg") return amount * 1000;
  if (unit === "l") return amount * 1000;
  if (unit === "tbsp") return amount * SPOON_TO_ML.tbsp;
  if (unit === "tsp") return amount * SPOON_TO_ML.tsp;
  return amount;
}

function convertBaseToUnit(baseAmount, unit) {
  if (!Number.isFinite(baseAmount)) return null;
  if (unit === "kg") return baseAmount / 1000;
  if (unit === "l") return baseAmount / 1000;
  if (unit === "tbsp") return baseAmount / SPOON_TO_ML.tbsp;
  if (unit === "tsp") return baseAmount / SPOON_TO_ML.tsp;
  return baseAmount;
}

function getContainerEstimatesByCategory(category) {
  const normalizedCategory = normalizeText(category || "other");
  return (
    CATEGORY_CONTAINER_ESTIMATES[normalizedCategory] ||
    CATEGORY_CONTAINER_ESTIMATES.other ||
    EMPTY_CONTAINER_ESTIMATES
  );
}

function estimateSpecialCompatibleBaseAmount({ requiredUnit, pantryItem }) {
  const itemUnit = normalizeUnit(pantryItem?.unit || "");
  const itemQuantity = Number(pantryItem?.quantity);
  if (!Number.isFinite(itemQuantity) || itemQuantity <= 0) return null;

  const requiredFamily = getUnitFamily(requiredUnit);
  const estimates = getContainerEstimatesByCategory(pantryItem?.category);

  if (requiredFamily === "volume") {
    if (itemUnit === "bottle" && Number.isFinite(estimates.bottleMl)) {
      return convertAmountToBase(itemQuantity * estimates.bottleMl, "ml");
    }
    if (itemUnit === "can" && Number.isFinite(estimates.canMl)) {
      return convertAmountToBase(itemQuantity * estimates.canMl, "ml");
    }
  }

  if (requiredFamily === "mass") {
    if (itemUnit === "pack" && Number.isFinite(estimates.packG)) {
      return convertAmountToBase(itemQuantity * estimates.packG, "g");
    }
    if (itemUnit === "can" && Number.isFinite(estimates.canG)) {
      return convertAmountToBase(itemQuantity * estimates.canG, "g");
    }
  }

  if (
    requiredFamily === "count" &&
    requiredUnit === "pcs" &&
    (itemUnit === "pack" || itemUnit === "bottle" || itemUnit === "can")
  ) {
    return convertAmountToBase(itemQuantity, "pcs");
  }

  return null;
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function namesLikelyMatch(ingredientName, pantryName) {
  if (!ingredientName || !pantryName) return false;
  const normalizedIngredient = normalizeFoodName(ingredientName);
  const normalizedPantry = normalizeFoodName(pantryName);
  if (!normalizedIngredient || !normalizedPantry) return false;

  if (normalizedIngredient === normalizedPantry) return true;
  if (
    (normalizedIngredient.length >= 4 &&
      normalizedPantry.includes(normalizedIngredient)) ||
    (normalizedPantry.length >= 4 && normalizedIngredient.includes(normalizedPantry))
  ) {
    return true;
  }

  const ingredientTokens = tokenizeFoodName(normalizedIngredient);
  const pantryTokens = tokenizeFoodName(normalizedPantry);
  if (ingredientTokens.length === 0 || pantryTokens.length === 0) {
    return false;
  }

  const pantryTokenSet = new Set(pantryTokens);
  let strongOverlap = 0;
  let weakOverlap = 0;

  for (const token of ingredientTokens) {
    if (pantryTokenSet.has(token)) {
      strongOverlap += 1;
      continue;
    }

    if (token.length >= 4) {
      const hasPartialToken = pantryTokens.some(
        (candidate) =>
          candidate.length >= 4 &&
          (candidate.includes(token) || token.includes(candidate))
      );
      if (hasPartialToken) {
        weakOverlap += 1;
      }
    }
  }

  if (strongOverlap >= 2) return true;
  if (strongOverlap >= 1 && ingredientTokens.length <= 2) return true;
  // Cho phép match một token lõi (vd: "ốc" trong "thịt ốc bươu")
  if (strongOverlap >= 1 && pantryTokens.length === 1 && pantryTokens[0].length >= 2) {
    return true;
  }

  const ingredientBigram = buildBigramSet(normalizedIngredient);
  const pantryBigram = buildBigramSet(normalizedPantry);
  const ngramScore = jaccardSimilarity(ingredientBigram, pantryBigram);

  return strongOverlap + weakOverlap >= 2 && ngramScore >= 0.28;
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

function triggerPantryNotificationForUser(userId, trigger) {
  runPantryExpiryNotificationJob({
    userId,
    trigger,
  }).catch((error) => {
    console.error("[PantryNotification] Failed to trigger user run", error);
  });
}

function resolveServingsForRecipe(recipe, servingsInput) {
  const baseServingsRaw = Number(recipe?.servings);
  const baseServings =
    Number.isFinite(baseServingsRaw) && baseServingsRaw > 0 ? baseServingsRaw : 1;
  const targetServingsRaw = Number(servingsInput);
  const targetServings =
    Number.isFinite(targetServingsRaw) && targetServingsRaw > 0
      ? targetServingsRaw
      : baseServings;

  return {
    baseServings,
    targetServings,
    scaleFactor: targetServings / baseServings,
  };
}

function evaluateRecipeAllergenMatch({ recipe, pantryItems }) {
  const allergens = Array.isArray(recipe?.allergens) ? recipe.allergens : [];
  if (allergens.length === 0) {
    return {
      totalAllergens: 0,
      allergenMatchCount: 0,
      allergenMatchRatio: 0,
      matchedAllergens: [],
    };
  }

  const pantryNames = pantryItems.map((item) => String(item?.name || "").trim());
  const matchedAllergens = allergens.filter((allergen) => {
    const allergenName = String(allergen || "").trim();
    if (!allergenName) return false;
    return pantryNames.some((pantryName) => namesLikelyMatch(allergenName, pantryName));
  });

  return {
    totalAllergens: allergens.length,
    allergenMatchCount: matchedAllergens.length,
    allergenMatchRatio: round2((matchedAllergens.length / allergens.length) * 100),
    matchedAllergens: matchedAllergens.slice(0, 5),
  };
}

function evaluateRecipeAgainstPantry({
  recipe,
  pantryItems,
  todayVietnamDayIndex,
  expiringDays,
  scaleFactor,
  includeMatchedPantryItems = true,
  maxMatchedPantryItems = 5,
}) {
  const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const checks = [];
  let enoughCount = 0;
  let partialCount = 0;
  let missingCount = 0;
  let unitMismatchCount = 0;
  let unknownRequirementCount = 0;
  let comparableRequiredTotal = 0;
  let comparableCoveredTotal = 0;

  for (const ingredient of ingredients) {
    const ingredientNameRaw = String(ingredient?.name || "").trim();
    const ingredientNameNormalized = normalizeFoodName(ingredientNameRaw);
    const requiredUnit = normalizeUnit(ingredient?.unit || "");
    const requiredAmountRaw = Number(ingredient?.amount);
    const hasValidAmount = Number.isFinite(requiredAmountRaw) && requiredAmountRaw > 0;
    const isScalable = ingredient?.scalable !== false;
    const requiredAmount = hasValidAmount
      ? requiredAmountRaw * (isScalable ? scaleFactor : 1)
      : null;

    const nameMatched = pantryItems.filter((item) =>
      namesLikelyMatch(ingredientNameNormalized, normalizeFoodName(item.name))
    );

    const compatibleItems = [];
    const unitMismatchedItems = [];
    let availableBaseAmount = 0;

    for (const item of nameMatched) {
      const itemUnit = normalizeUnit(item.unit);
      const specialBaseAmount = estimateSpecialCompatibleBaseAmount({
        requiredUnit,
        pantryItem: item,
      });
      if (specialBaseAmount != null) {
        availableBaseAmount += specialBaseAmount;
        compatibleItems.push(item);
        continue;
      }

      if (!areUnitsCompatible(requiredUnit, itemUnit)) {
        unitMismatchedItems.push(item);
        continue;
      }

      const itemQuantity = Number(item.quantity);
      if (!Number.isFinite(itemQuantity) || itemQuantity <= 0) {
        continue;
      }

      const itemBase = convertAmountToBase(itemQuantity, itemUnit);
      if (itemBase == null) {
        continue;
      }

      availableBaseAmount += itemBase;
      compatibleItems.push(item);
    }

    let status = "missing";
    let coveragePercent = null;
    let availableAmount = null;

    if (!ingredientNameRaw || !requiredUnit || !hasValidAmount) {
      status = "unknown_requirement";
      unknownRequirementCount += 1;
    } else {
      const requiredBaseAmount = convertAmountToBase(requiredAmount, requiredUnit);
      const availableInRequiredUnit = convertBaseToUnit(availableBaseAmount, requiredUnit);

      if (requiredBaseAmount != null) {
        comparableRequiredTotal += requiredBaseAmount;
        comparableCoveredTotal += Math.min(requiredBaseAmount, availableBaseAmount);
        coveragePercent = round2(
          Math.min(1, availableBaseAmount / requiredBaseAmount) * 100
        );
      }

      if (availableInRequiredUnit != null) {
        availableAmount = round2(availableInRequiredUnit);
      }

      if (compatibleItems.length === 0 && unitMismatchedItems.length > 0) {
        status = "unit_mismatch";
        unitMismatchCount += 1;
      } else if (requiredBaseAmount != null && availableBaseAmount >= requiredBaseAmount) {
        status = "enough";
        enoughCount += 1;
      } else if (availableBaseAmount > 0) {
        status = "partial";
        partialCount += 1;
      } else {
        status = "missing";
        missingCount += 1;
      }
    }

    const check = {
      name: ingredientNameRaw,
      requiredAmount: requiredAmount == null ? null : round2(requiredAmount),
      requiredUnit: ingredient?.unit || null,
      normalizedRequiredUnit: requiredUnit || null,
      availableAmount,
      status,
      coveragePercent,
      matchedCount: compatibleItems.length,
      unitMismatchCount: unitMismatchedItems.length,
    };

    if (includeMatchedPantryItems) {
      check.matchedPantryItems = compatibleItems
        .slice(0, maxMatchedPantryItems)
        .map((item) => {
          const itemStatus = getStatusAndDays(
            item.expiryDate,
            todayVietnamDayIndex,
            expiringDays
          );
          return {
            _id: item._id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            expiryDate: item.expiryDate,
            storageLocation: item.storageLocation,
            category: item.category,
            status: itemStatus.status,
            daysToExpire: itemStatus.daysToExpire,
          };
        });
    }

    checks.push(check);
  }

  const coveragePercent =
    comparableRequiredTotal > 0
      ? round2((comparableCoveredTotal / comparableRequiredTotal) * 100)
      : null;

  const summary = {
    totalIngredients: checks.length,
    enoughCount,
    partialCount,
    missingCount,
    unitMismatchCount,
    unknownRequirementCount,
    coveragePercent,
    canCook:
      missingCount === 0 &&
      partialCount === 0 &&
      unitMismatchCount === 0 &&
      unknownRequirementCount === 0,
  };

  return { checks, summary };
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

  const parsedQuantity = Number(quantity);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "quantity phải là số lớn hơn 0",
    });
  }

  const normalizedUnit = normalizeUnit(unit);
  if (!UNIT_VALUES.includes(normalizedUnit)) {
    return res.status(400).json({
      success: false,
      message: `unit không hợp lệ. Chỉ nhận: ${UNIT_VALUES.join(", ")}`,
    });
  }

  const normalizedStorageLocation = String(storageLocation).trim().toLowerCase();
  if (!STORAGE_VALUES.includes(normalizedStorageLocation)) {
    return res.status(400).json({
      success: false,
      message: `storageLocation không hợp lệ. Chỉ nhận: ${STORAGE_VALUES.join(", ")}`,
    });
  }

  const normalizedCategory = category == null ? "other" : String(category).trim();
  if (normalizedCategory && !CATEGORY_VALUES.includes(normalizedCategory)) {
    return res.status(400).json({
      success: false,
      message: `category không hợp lệ. Chỉ nhận: ${CATEGORY_VALUES.join(", ")}`,
    });
  }

  const pantryItem = await Pantry.create({
    user: req.user._id,
    name,
    quantity: parsedQuantity,
    unit: normalizedUnit,
    storageLocation: normalizedStorageLocation,
    expiryDate: parsedExpiryDate.value,
    category: normalizedCategory,
    ...(parsedOpenedDate.provided ? { openedDate: parsedOpenedDate.value } : {}),
    notes,
  });

  triggerPantryNotificationForUser(req.user._id, "pantry_create");

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

export const checkRecipeCookability = asyncHandler(async (req, res) => {
  const { recipeId, servings } = req.body || {};
  if (!recipeId) {
    return res.status(400).json({
      success: false,
      message: "recipeId là bắt buộc",
    });
  }

  const idOrSlug = String(recipeId).trim();
  let recipe = await Recipe.findOne({ id: idOrSlug }).lean();
  if (!recipe && mongoose.isValidObjectId(idOrSlug)) {
    recipe = await Recipe.findById(idOrSlug).lean();
  }

  if (!recipe) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy công thức",
    });
  }

  const servingsContext = resolveServingsForRecipe(recipe, servings);
  const { baseServings, targetServings, scaleFactor } = servingsContext;

  const expiringDays = clampExpiringDays(req.query.days ?? req.body?.days);
  const todayVietnamDayIndex = getTodayVietnamDayIndex();
  const { startOfTodayUtc } = getVietnamBoundaries(todayVietnamDayIndex, expiringDays);

  const pantryItems = await Pantry.find({
    user: req.user._id,
    expiryDate: { $gte: startOfTodayUtc },
  })
    .select("_id name quantity unit expiryDate storageLocation category")
    .lean();

  const evaluation = evaluateRecipeAgainstPantry({
    recipe,
    pantryItems,
    todayVietnamDayIndex,
    expiringDays,
    scaleFactor,
    includeMatchedPantryItems: true,
    maxMatchedPantryItems: 5,
  });

  return res.status(200).json({
    success: true,
    data: {
      recipe: {
        _id: recipe._id,
        id: recipe.id || null,
        name_vi: recipe.name_vi || "",
        baseServings,
        targetServings,
        scaleFactor: round2(scaleFactor),
      },
      summary: evaluation.summary,
      checks: evaluation.checks,
    },
    meta: {
      pantryItemsChecked: pantryItems.length,
      expiringDays,
      timezone: VIETNAM_TZ,
    },
  });
});

export const suggestRecipesFromPantry = asyncHandler(async (req, res) => {
  const { canCookOnly, servings } = req.body || {};

  // Giữ API suggest đơn giản cho user: chỉ chọn canCookOnly.
  const finalLimit = 10;
  const finalCandidateLimit = 500;
  const finalMinCoverage = 15;
  const finalMinMatchedIngredientRatio = 15;
  const finalMinUsableMatchedIngredients = 2;
  const finalMinAllergenMatchCount = 2;
  const finalMinAllergenMatchRatio = 50;
  const finalCanCookOnly = canCookOnly === true;
  const expiringDays = clampExpiringDays(req.query.days ?? req.body?.days);

  const todayVietnamDayIndex = getTodayVietnamDayIndex();
  const { startOfTodayUtc } = getVietnamBoundaries(todayVietnamDayIndex, expiringDays);

  const [pantryItems, recipes] = await Promise.all([
    Pantry.find({
      user: req.user._id,
      expiryDate: { $gte: startOfTodayUtc },
    })
      .select("_id name quantity unit expiryDate storageLocation category")
      .lean(),
    Recipe.find({})
      .select(
        "_id id name_vi meal_types region difficulty diet_tags allergens prep_time_min cook_time_min servings image_url ingredients"
      )
      .limit(finalCandidateLimit)
      .lean(),
  ]);

  const ranked = recipes
    .map((recipe) => {
      const servingsContext = resolveServingsForRecipe(recipe, servings);
      const evaluation = evaluateRecipeAgainstPantry({
        recipe,
        pantryItems,
        todayVietnamDayIndex,
        expiringDays,
        scaleFactor: servingsContext.scaleFactor,
        includeMatchedPantryItems: false,
      });
      const allergenMatch = evaluateRecipeAllergenMatch({
        recipe,
        pantryItems,
      });

      const blockerStatuses = new Set([
        "missing",
        "partial",
        "unit_mismatch",
        "unknown_requirement",
      ]);
      const blockers = evaluation.checks
        .filter((check) => blockerStatuses.has(check.status))
        .slice(0, 5)
        .map((check) => ({
          name: check.name,
          status: check.status,
          requiredAmount: check.requiredAmount,
          requiredUnit: check.requiredUnit,
          availableAmount: check.availableAmount,
          coveragePercent: check.coveragePercent,
        }));

      const score =
        (evaluation.summary.canCook ? 10000 : 0) +
        (evaluation.summary.coveragePercent ?? 0) * 10 -
        evaluation.summary.missingCount * 8 -
        evaluation.summary.unitMismatchCount * 6 -
        evaluation.summary.unknownRequirementCount * 12 +
        allergenMatch.allergenMatchCount * 120 +
        allergenMatch.allergenMatchRatio * 2;

      const matchedIngredientCount =
        evaluation.summary.enoughCount +
        evaluation.summary.partialCount +
        evaluation.summary.unitMismatchCount;
      const matchedIngredientRatio =
        evaluation.summary.totalIngredients > 0
          ? round2(
              (matchedIngredientCount / evaluation.summary.totalIngredients) * 100
            )
          : 0;
      const usableMatchedIngredientCount =
        evaluation.summary.enoughCount + evaluation.summary.partialCount;

      const summary = {
        ...evaluation.summary,
        matchedIngredientCount,
        matchedIngredientRatio,
        usableMatchedIngredientCount,
        totalAllergens: allergenMatch.totalAllergens,
        allergenMatchCount: allergenMatch.allergenMatchCount,
        allergenMatchRatio: allergenMatch.allergenMatchRatio,
        matchedAllergens: allergenMatch.matchedAllergens,
      };

      const hasStrongAllergenMatch =
        summary.allergenMatchCount >= finalMinAllergenMatchCount ||
        summary.allergenMatchRatio >= finalMinAllergenMatchRatio;

      return {
        score,
        matchPercent: summary.coveragePercent ?? 0,
        hasStrongAllergenMatch,
        recipe: {
          _id: recipe._id,
          id: recipe.id || null,
          name_vi: recipe.name_vi || "",
          meal_types: recipe.meal_types || [],
          region: recipe.region || null,
          difficulty: recipe.difficulty || null,
          diet_tags: recipe.diet_tags || [],
          prep_time_min: recipe.prep_time_min ?? null,
          cook_time_min: recipe.cook_time_min ?? null,
          image_url: recipe.image_url || null,
          servings: {
            base: servingsContext.baseServings,
            target: servingsContext.targetServings,
            scaleFactor: round2(servingsContext.scaleFactor),
          },
        },
        summary,
        blockers,
      };
    })
    .filter(
      (item) =>
        (finalCanCookOnly && item.summary.canCook) ||
        (!finalCanCookOnly &&
          (item.summary.canCook ||
            item.hasStrongAllergenMatch ||
            ((item.summary.coveragePercent ?? 0) >= finalMinCoverage &&
              (item.summary.usableMatchedIngredientCount ?? 0) >=
                finalMinUsableMatchedIngredients &&
              (item.summary.matchedIngredientRatio ?? 0) >=
                finalMinMatchedIngredientRatio &&
              item.summary.missingCount <=
                Math.max(4, (item.summary.totalIngredients ?? 0) - 2))))
    )
    .sort((a, b) => {
      if (b.summary.canCook !== a.summary.canCook) {
        return Number(b.summary.canCook) - Number(a.summary.canCook);
      }
      if (b.summary.allergenMatchCount !== a.summary.allergenMatchCount) {
        return b.summary.allergenMatchCount - a.summary.allergenMatchCount;
      }
      if (b.summary.allergenMatchRatio !== a.summary.allergenMatchRatio) {
        return b.summary.allergenMatchRatio - a.summary.allergenMatchRatio;
      }
      if (b.summary.usableMatchedIngredientCount !== a.summary.usableMatchedIngredientCount) {
        return (
          b.summary.usableMatchedIngredientCount - a.summary.usableMatchedIngredientCount
        );
      }
      if (b.summary.matchedIngredientRatio !== a.summary.matchedIngredientRatio) {
        return b.summary.matchedIngredientRatio - a.summary.matchedIngredientRatio;
      }
      if (a.summary.missingCount !== b.summary.missingCount) {
        return a.summary.missingCount - b.summary.missingCount;
      }
      const bCoverage = b.summary.coveragePercent ?? -1;
      const aCoverage = a.summary.coveragePercent ?? -1;
      if (bCoverage !== aCoverage) return bCoverage - aCoverage;
      return b.score - a.score;
    });

  const items = ranked.slice(0, finalLimit).map(({ score, ...item }) => item);
  const noResultHint =
    items.length === 0
      ? finalCanCookOnly
        ? "Không có công thức nào nấu được 100% với pantry hiện tại. Hãy tắt canCookOnly hoặc thêm nguyên liệu."
        : "Không có công thức nào đủ liên quan với pantry hiện tại. Hãy thêm nguyên liệu hoặc tăng số lượng."
      : null;

  return res.status(200).json({
    success: true,
    data: {
      items,
    },
    meta: {
      strategy: "rule_v1",
      scannedRecipes: recipes.length,
      qualifiedRecipes: ranked.length,
      returned: items.length,
      limit: finalLimit,
      candidateLimit: finalCandidateLimit,
      canCookOnly: finalCanCookOnly,
      minCoveragePercent: finalMinCoverage,
      minMatchedIngredientRatio: finalMinMatchedIngredientRatio,
      pantryItemsChecked: pantryItems.length,
      expiringDays,
      timezone: VIETNAM_TZ,
      noResultHint,
      filters: {
        canCookOnly: finalCanCookOnly,
      },
    },
  });
});

export const bulkDeletePantryItems = asyncHandler(async (req, res) => {
  const { ids } = req.body || {};

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng truyền mảng ids cần xóa",
    });
  }

  if (ids.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Tối đa 500 item cho mỗi lần xóa hàng loạt",
    });
  }

  const { validIds, invalidIds } = normalizeObjectIdList(ids);

  if (validIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Không có id hợp lệ để xóa",
      data: {
        requested: ids.length,
        invalid: invalidIds.length,
      },
    });
  }

  const result = await Pantry.deleteMany({
    _id: { $in: validIds },
    user: req.user._id,
  });

  const deletedCount = result?.deletedCount || 0;

  return res.status(200).json({
    success: true,
    message: "Xóa hàng loạt pantry item thành công",
    data: {
      requested: ids.length,
      valid: validIds.length,
      invalid: invalidIds.length,
      deleted: deletedCount,
      notFound: Math.max(0, validIds.length - deletedCount),
    },
  });
});

export const bulkUpdatePantryQuantities = asyncHandler(async (req, res) => {
  const { items } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng truyền mảng items gồm id và quantity",
    });
  }

  if (items.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Tối đa 500 item cho mỗi lần cập nhật hàng loạt",
    });
  }

  const quantityById = new Map();
  const invalidItems = [];

  for (let i = 0; i < items.length; i += 1) {
    const row = items[i] || {};
    const id = String(row.id || "").trim();
    const quantity = Number(row.quantity);

    if (!id || !mongoose.isValidObjectId(id)) {
      invalidItems.push({ index: i, reason: "id_khong_hop_le" });
      continue;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      invalidItems.push({ index: i, reason: "quantity_phai_lon_hon_0" });
      continue;
    }

    quantityById.set(id, quantity);
  }

  if (quantityById.size === 0) {
    return res.status(400).json({
      success: false,
      message: "Không có item hợp lệ để cập nhật",
      data: {
        requested: items.length,
        invalid: invalidItems.length,
      },
    });
  }

  const operations = Array.from(quantityById.entries()).map(([id, quantity]) => ({
    updateOne: {
      filter: { _id: id, user: req.user._id },
      update: { $set: { quantity } },
    },
  }));

  const result = await Pantry.bulkWrite(operations, { ordered: false });

  const matched = result?.matchedCount ?? result?.nMatched ?? 0;
  const modified = result?.modifiedCount ?? result?.nModified ?? 0;
  const valid = quantityById.size;

  return res.status(200).json({
    success: true,
    message: "Cập nhật số lượng hàng loạt thành công",
    data: {
      requested: items.length,
      valid,
      invalid: invalidItems.length,
      matched,
      modified,
      notFound: Math.max(0, valid - matched),
      invalidItems,
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

  triggerPantryNotificationForUser(req.user._id, "pantry_update");

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
