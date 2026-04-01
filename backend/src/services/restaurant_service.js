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

export async function getRestaurantsByDish({ recipeId, lat, lng }) {
  const recipe = await findRecipeById(recipeId);
  if (!recipe) {
    throw new AppError("Recipe not found", 404, "RECIPE_NOT_FOUND");
  }

  const cacheKey = toCacheKey(recipeId, lat, lng);
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return cached;
  }

  const places = await searchNearbyRestaurants({
    lat,
    lng,
    keyword: recipe.name_vi,
    radius: 3000,
  });

  const restaurants = places
    .map((item) => {
      const location = item?.geometry?.location || {};
      const placeLat = Number(location.lat);
      const placeLng = Number(location.lng);

      if (!Number.isFinite(placeLat) || !Number.isFinite(placeLng)) {
        return null;
      }

      const distanceKm = haversineKm(
        Number(lat),
        Number(lng),
        placeLat,
        placeLng,
      );
      const rating = Number.isFinite(item?.rating) ? Number(item.rating) : 0;

      return {
        name: item.name || "Unknown",
        address: item.vicinity || item.formatted_address || "Unknown",
        rating,
        lat: placeLat,
        lng: placeLng,
        distance: formatDistanceKm(distanceKm),
        _distanceKm: distanceKm,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a._distanceKm - b._distanceKm;
    })
    .map(({ _distanceKm, ...restaurant }) => restaurant);

  if (restaurants.length === 0) {
    throw new AppError(
      "No restaurants found for this dish",
      404,
      "RESTAURANTS_NOT_FOUND",
    );
  }

  const payload = {
    recipe: recipe.name_vi,
    restaurants,
  };

  setCachedResult(cacheKey, payload);
  return payload;
}
