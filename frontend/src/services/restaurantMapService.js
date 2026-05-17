import axiosInstance from "./axiosInstance";

const FALLBACK_LOCATION = {
  lat: 16.0544,
  lng: 108.2022,
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const restaurantCache = new Map();

function toCacheKey(meal, lat, lng, intent) {
  const recipeId = resolveRecipeId(meal);
  const recipeName = resolveRecipeName(meal).toLowerCase();
  return `${recipeId || recipeName}:${Number(lat).toFixed(3)}:${Number(lng).toFixed(3)}:${intent}`;
}

function getCachedResult(cacheKey) {
  const item = restaurantCache.get(cacheKey);
  if (!item) return null;
  if (item.expiresAt < Date.now()) {
    restaurantCache.delete(cacheKey);
    return null;
  }
  return item.payload;
}

function setCachedResult(cacheKey, payload) {
  restaurantCache.set(cacheKey, {
    payload,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function resolveRecipeId(meal) {
  return meal?._id || meal?.id || meal?.recipe_id || "";
}

function resolveRecipeName(meal) {
  return String(meal?.name_vi || meal?.title || meal?.name || "").trim();
}

export async function fetchRestaurantsByDish({
  meal,
  lat,
  lng,
  intent = "eat-out",
}) {
  const recipeId = resolveRecipeId(meal);
  const recipeName = resolveRecipeName(meal);
  if (!recipeId && !recipeName) {
    throw new Error("Không tìm thấy tên món ăn để tìm quán.");
  }

  const safeLat = Number(lat);
  const safeLng = Number(lng);

  if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) {
    throw new Error("Không thể xác định vị trí của bạn để tìm quán gần đây.");
  }

  const params = {
    lat: safeLat,
    lng: safeLng,
    intent,
  };

  if (recipeId) {
    params.recipe_id = recipeId;
  }

  if (recipeName) {
    params.recipe_name = recipeName;
  }

  if (meal?.diet_tags?.[0]) {
    params.diet_tag = String(meal.diet_tags[0]);
  }

  const cacheKey = toCacheKey(meal, safeLat, safeLng, intent);
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;

  const { data } = await axiosInstance.get("/restaurants-by-dish", { params });
  setCachedResult(cacheKey, data);
  return data;
}

export { FALLBACK_LOCATION };
