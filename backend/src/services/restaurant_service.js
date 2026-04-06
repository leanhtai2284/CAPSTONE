import { searchNearbyRestaurants } from "../integrations/googleMaps.service.js";
import { findRecipeById } from "../repositories/recipe.repository.js";
import AppError from "../utils/appError.js";
import { formatDistanceKm, haversineKm } from "../utils/distance.js";

const CACHE_TTL_MS = 5 * 60 * 1000;
const restaurantCache = new Map();

function toCacheKey(recipeId, lat, lng) {
  return `${recipeId}:${Number(lat).toFixed(4)}:${Number(lng).toFixed(4)}`;
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

function buildSearchKeywords({ recipe, intent, dietTag }) {
  const keywords = [];
  const recipeName = String(recipe?.name_vi || "").trim();
  const segments = inferCuisineSegments(recipe, dietTag);

  if (recipeName) {
    keywords.push(recipeName, `${recipeName} restaurant`);
  }

  segments.forEach((segment) => {
    keywords.push(...getKeywordsBySegment(segment));
  });

  if (intent === "eat-out") {
    keywords.push("quan an gan day", "nha hang gan day");
  }

  if (!keywords.length) {
    keywords.push("restaurant");
  }

  return [
    ...new Set(keywords.map((item) => item.trim()).filter(Boolean)),
  ].slice(0, 8);
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
    _distanceKm: distanceKm,
  };
}

export async function getRestaurantsByDish({
  recipeId,
  lat,
  lng,
  intent = "eat-out",
  dietTag,
}) {
  const recipe = await findRecipeById(recipeId);
  if (!recipe) {
    throw new AppError("Recipe not found", 404, "RECIPE_NOT_FOUND");
  }

  const cacheKey = `${toCacheKey(recipeId, lat, lng)}:${intent}:${normalizeText(dietTag)}`;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return cached;
  }

  const keywords = buildSearchKeywords({ recipe, intent, dietTag });
  const inferredSegments = inferCuisineSegments(recipe, dietTag);

  const placesGroups = await Promise.allSettled(
    keywords.map((keyword) =>
      searchNearbyRestaurants({
        lat,
        lng,
        keyword,
        radius: 3000,
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
    const transformed = toRestaurant(item, lat, lng);
    if (!transformed) return;
    const existing = deduped.get(transformed.id);
    if (!existing || transformed.rating > existing.rating) {
      deduped.set(transformed.id, transformed);
    }
  });

  const restaurants = Array.from(deduped.values())
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a._distanceKm - b._distanceKm;
    })
    .slice(0, 20)
    .map(({ _distanceKm, id, ...restaurant }) => restaurant);

  if (restaurants.length === 0) {
    throw new AppError(
      "No nearby restaurants found for this context",
      404,
      "RESTAURANTS_NOT_FOUND",
    );
  }

  const payload = {
    recipe: recipe.name_vi,
    search_context: {
      intent,
      diet_tag: dietTag || null,
      inferred_segments: inferredSegments,
      matched_keywords: keywords,
    },
    restaurants,
  };

  setCachedResult(cacheKey, payload);
  return payload;
}
