import { searchNearbyRestaurants } from "../integrations/googleMaps.service.js";
import {
  findRecipeById,
  findRecipeByName,
} from "../repositories/recipe.repository.js";
import AppError from "../utils/appError.js";
import { formatDistanceKm, haversineKm } from "../utils/distance.js";

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_ALLOWED_DISTANCE_KM = 25;
const SEARCH_RADIUS_M = 5000;
const restaurantCache = new Map();
const DA_NANG_FALLBACK_LOCATION = {
  lat: 16.0544,
  lng: 108.2022,
};

function toCacheKey(recipeRef, lat, lng) {
  return `${recipeRef}:${Number(lat).toFixed(4)}:${Number(lng).toFixed(4)}`;
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

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function normalizeAndUnaccent(value) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildContextText(recipe, dietTag) {
  const recipeTags = Array.isArray(recipe?.diet_tags)
    ? recipe.diet_tags.map((item) => normalizeText(item)).join(" ")
    : "";

  return [normalizeText(recipe?.name_vi), normalizeText(dietTag), recipeTags]
    .filter(Boolean)
    .join(" ");
}

function inferCuisineSegments(recipe, dietTag) {
  const text = buildContextText(recipe, dietTag);
  const segments = new Set();

  const includesAny = (terms) => terms.some((term) => text.includes(term));

  if (includesAny(["chay", "vegetarian", "vegan", "thuần chay"])) {
    segments.add("vegetarian");
  }
  if (includesAny(["phở", "pho"])) segments.add("pho");
  if (includesAny(["bún", "bun", "miến", "mien", "hủ tiếu", "hu tieu"])) {
    segments.add("noodle");
  }
  if (includesAny(["cơm", "com"])) segments.add("rice");
  if (includesAny(["lẩu", "lau", "hotpot"])) segments.add("hotpot");
  if (includesAny(["nướng", "nuong", "bbq"])) segments.add("grill");
  if (includesAny(["hải sản", "hai san", "seafood"])) segments.add("seafood");
  if (
    includesAny(["bò", "bo", "gà", "ga", "heo", "lợn", "lon", "thịt", "thit"])
  ) {
    segments.add("savory");
  }

  if (!segments.size) {
    segments.add("savory");
  }

  return [...segments];
}

function inferDietMode(recipe, dietTag) {
  const text = buildContextText(recipe, dietTag);
  const includesAny = (terms) => terms.some((term) => text.includes(term));

  if (includesAny(["keto", "low carb", "low-carb", "it carb"])) {
    return "keto";
  }

  if (
    includesAny(["chay", "vegetarian", "vegan", "thuan chay", "thuần chay"])
  ) {
    return "vegetarian";
  }

  return "savory";
}

function getKeywordsBySegment(segment) {
  const dictionary = {
    vegetarian: ["nha hang chay", "quan chay", "vegan restaurant"],
    pho: ["quan pho", "pho restaurant"],
    noodle: ["quan bun", "quan hu tieu", "quan mi"],
    rice: ["quan com", "com tam", "com van phong"],
    hotpot: ["quan lau", "hotpot restaurant"],
    grill: ["quan nuong", "bbq restaurant"],
    seafood: ["quan hai san", "seafood restaurant"],
    savory: ["quan an viet", "nha hang mon viet", "quan mon man"],
  };

  return dictionary[segment] || [];
}

function getKeywordsByDietMode(mode) {
  const dictionary = {
    savory: ["quan mon man", "quan com", "quan an gia dinh"],
    vegetarian: ["quan chay", "nha hang chay", "vegan restaurant"],
    keto: ["keto restaurant", "low carb restaurant", "quan an healthy"],
  };

  return dictionary[mode] || [];
}

function isDaNangLocation(lat, lng) {
  const safeLat = Number(lat);
  const safeLng = Number(lng);

  if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) return false;

  return (
    safeLat >= 15.9 && safeLat <= 16.2 && safeLng >= 108.05 && safeLng <= 108.35
  );
}

function buildSearchKeywords({
  recipe,
  recipeName,
  intent,
  dietTag,
  lat,
  lng,
}) {
  const keywords = [];
  const resolvedRecipeName = String(recipe?.name_vi || recipeName || "").trim();
  const segments = inferCuisineSegments(recipe, dietTag);
  const dietMode = inferDietMode(recipe, dietTag);
  const inDaNang = isDaNangLocation(lat, lng);

  if (resolvedRecipeName) {
    keywords.push(resolvedRecipeName, `${resolvedRecipeName} restaurant`);
    if (inDaNang) {
      keywords.push(
        `${resolvedRecipeName} da nang`,
        `${resolvedRecipeName} quan an da nang`,
      );
    }
  }

  segments.forEach((segment) => {
    keywords.push(...getKeywordsBySegment(segment));
  });

  keywords.push(...getKeywordsByDietMode(dietMode));

  if (intent === "eat-out") {
    keywords.push("quan an gan day", "nha hang gan day");
    if (inDaNang) {
      keywords.push("quan an da nang", "nha hang da nang");
    }
  }

  if (!keywords.length) {
    keywords.push("restaurant");
  }

  return [
    ...new Set(keywords.map((item) => item.trim()).filter(Boolean)),
  ].slice(0, 12);
}

function getDishTokens(recipeName) {
  const stopWords = new Set([
    "mon",
    "quan",
    "nha",
    "hang",
    "an",
    "restaurant",
    "da",
    "nang",
  ]);

  return normalizeAndUnaccent(recipeName)
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !stopWords.has(token));
}

function computeNameMatchScore(restaurant, recipeName) {
  const normalizedDish = normalizeAndUnaccent(recipeName);
  const searchableText = normalizeAndUnaccent(
    [restaurant?.name, restaurant?._searchableText].filter(Boolean).join(" "),
  );

  if (!normalizedDish || !searchableText) return 0;

  let score = 0;
  if (searchableText.includes(normalizedDish)) {
    score += 8;
  }

  const tokens = getDishTokens(recipeName);
  const tokenHits = tokens.filter((token) =>
    searchableText.includes(token),
  ).length;
  score += Math.min(tokenHits * 2, 6);

  return score;
}

function computeDietModeScore(restaurant, dietMode) {
  const text = normalizeAndUnaccent(
    [restaurant?.name, restaurant?._searchableText, restaurant?._cuisine]
      .filter(Boolean)
      .join(" "),
  );

  if (!text) return 0;

  if (dietMode === "vegetarian") {
    return /\b(chay|vegan|vegetarian)\b/.test(text) ? 6 : 0;
  }

  if (dietMode === "keto") {
    return /\b(keto|low\s*carb|healthy|protein)\b/.test(text) ? 6 : 0;
  }

  if (dietMode === "savory") {
    return /\b(mon\s*man|quan\s*an|com|pho|bun|lau|nuong|hai\s*san)\b/.test(
      text,
    )
      ? 4
      : 0;
  }

  return 0;
}

function applyDietModeFiltering(restaurants, dietMode) {
  if (!["vegetarian", "keto"].includes(dietMode)) {
    return restaurants;
  }

  const strictMatches = restaurants.filter((item) => item._dietModeScore > 0);
  if (!strictMatches.length) {
    return restaurants;
  }

  const nonStrictMatches = restaurants.filter(
    (item) => item._dietModeScore <= 0,
  );
  return [...strictMatches, ...nonStrictMatches.slice(0, 8)];
}

function toRestaurant(item, lat, lng) {
  const location = item?.geometry?.location || {};
  const placeLat = Number(location.lat);
  const placeLng = Number(location.lng);

  if (!Number.isFinite(placeLat) || !Number.isFinite(placeLng)) {
    return null;
  }

  const distanceKm = haversineKm(Number(lat), Number(lng), placeLat, placeLng);
  const rating = Number.isFinite(item?.rating) ? Number(item.rating) : 0;

  return {
    id: item.place_id || `${item.name || ""}_${placeLat}_${placeLng}`,
    name: item.name || "Unknown",
    address: item.vicinity || item.formatted_address || "Unknown",
    rating,
    lat: placeLat,
    lng: placeLng,
    distance: formatDistanceKm(distanceKm),
    _searchableText: item?._searchable_text || "",
    _cuisine: item?._cuisine || "",
    _distanceKm: distanceKm,
  };
}

export async function getRestaurantsByDish({
  recipeId,
  recipeName,
  lat,
  lng,
  intent = "eat-out",
  dietTag,
}) {
  const safeLat = Number.isFinite(Number(lat))
    ? Number(lat)
    : DA_NANG_FALLBACK_LOCATION.lat;
  const safeLng = Number.isFinite(Number(lng))
    ? Number(lng)
    : DA_NANG_FALLBACK_LOCATION.lng;
  const safeRecipeName = String(recipeName || "").trim();

  let recipe = null;
  if (recipeId) {
    recipe = await findRecipeById(recipeId);
  }

  if (!recipe && safeRecipeName) {
    recipe = await findRecipeByName(safeRecipeName);
  }

  if (!recipe && !safeRecipeName) {
    throw new AppError(
      "Recipe id or recipe name is required",
      400,
      "RECIPE_INPUT_REQUIRED",
    );
  }

  const effectiveRecipeName = recipe?.name_vi || safeRecipeName;
  if (!effectiveRecipeName) {
    throw new AppError("Recipe not found", 404, "RECIPE_NOT_FOUND");
  }

  const recipeContext = recipe || {
    name_vi: effectiveRecipeName,
    diet_tags: safeRecipeName ? [] : undefined,
  };

  const recipeRef = String(recipeId || effectiveRecipeName)
    .trim()
    .toLowerCase();
  const cacheKey = `${toCacheKey(recipeRef, safeLat, safeLng)}:${intent}:${normalizeText(dietTag)}`;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return cached;
  }

  const dietMode = inferDietMode(recipeContext, dietTag);

  const keywords = buildSearchKeywords({
    recipe: recipeContext,
    recipeName: effectiveRecipeName,
    intent,
    dietTag,
    lat: safeLat,
    lng: safeLng,
  });
  const inferredSegments = inferCuisineSegments(recipeContext, dietTag);

  const placesGroups = await Promise.allSettled(
    keywords.map((keyword) =>
      searchNearbyRestaurants({
        lat: safeLat,
        lng: safeLng,
        keyword,
        radius: SEARCH_RADIUS_M,
      }),
    ),
  );

  const fulfilledGroups = placesGroups
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  if (fulfilledGroups.length === 0) {
    const firstRejected = placesGroups.find(
      (result) => result.status === "rejected",
    );
    throw (
      firstRejected?.reason ||
      new AppError(
        "Unable to fetch nearby restaurants at the moment",
        500,
        "GOOGLE_PLACES_REQUEST_ERROR",
      )
    );
  }

  const deduped = new Map();
  fulfilledGroups.flat().forEach((item) => {
    const transformed = toRestaurant(item, safeLat, safeLng);
    if (!transformed) return;
    const existing = deduped.get(transformed.id);
    if (!existing || transformed.rating > existing.rating) {
      deduped.set(transformed.id, transformed);
    }
  });

  const normalizedRestaurants = Array.from(deduped.values()).filter((item) =>
    Number.isFinite(item._distanceKm),
  );

  const withinPreferredDistance = normalizedRestaurants.filter(
    (item) => item._distanceKm <= MAX_ALLOWED_DISTANCE_KM,
  );

  const candidatePool = withinPreferredDistance.length
    ? withinPreferredDistance
    : normalizedRestaurants;

  const scoredRestaurants = candidatePool.map((item) => {
    const nameMatchScore = computeNameMatchScore(item, effectiveRecipeName);
    const dietModeScore = computeDietModeScore(item, dietMode);
    return {
      ...item,
      _nameMatchScore: nameMatchScore,
      _dietModeScore: dietModeScore,
      _relevanceScore: nameMatchScore + dietModeScore,
    };
  });

  const restaurants = applyDietModeFiltering(scoredRestaurants, dietMode)
    .sort((a, b) => {
      if (b._relevanceScore !== a._relevanceScore) {
        return b._relevanceScore - a._relevanceScore;
      }
      if (a._distanceKm !== b._distanceKm) return a._distanceKm - b._distanceKm;
      return b.rating - a.rating;
    })
    .slice(0, 20)
    .map(
      ({
        _distanceKm,
        _searchableText,
        _cuisine,
        _nameMatchScore,
        _dietModeScore,
        _relevanceScore,
        id,
        ...restaurant
      }) => restaurant,
    );

  if (restaurants.length === 0) {
    throw new AppError(
      "No nearby restaurants found for this context",
      404,
      "RESTAURANTS_NOT_FOUND",
    );
  }

  const payload = {
    recipe: effectiveRecipeName,
    search_context: {
      intent,
      diet_tag: dietTag || null,
      diet_mode: dietMode,
      request_location: {
        lat: safeLat,
        lng: safeLng,
      },
      inferred_segments: inferredSegments,
      matched_keywords: keywords,
    },
    restaurants,
  };

  setCachedResult(cacheKey, payload);
  return payload;
}
