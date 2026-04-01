import axios from "axios";
import AppError from "../utils/appError.js";

const placesClient = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api/place",
  timeout: 8000,
});

const ERROR_STATUSES = new Set([
  "OVER_QUERY_LIMIT",
  "REQUEST_DENIED",
  "INVALID_REQUEST",
  "UNKNOWN_ERROR",
]);

export async function searchNearbyRestaurants({
  lat,
  lng,
  keyword,
  radius = 3000,
}) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new AppError(
      "Google Maps API key is not configured",
      500,
      "GOOGLE_MAPS_KEY_MISSING",
    );
  }

  try {
    const response = await placesClient.get("/nearbysearch/json", {
      params: {
        location: `${lat},${lng}`,
        radius,
        keyword,
        type: "restaurant",
        key: apiKey,
      },
    });

    const payload = response.data || {};
    if (payload.status === "OK") {
      return payload.results || [];
    }

    if (payload.status === "ZERO_RESULTS") {
      return [];
    }

    if (ERROR_STATUSES.has(payload.status)) {
      throw new AppError(
        "Restaurant provider is temporarily unavailable",
        500,
        "GOOGLE_PLACES_FAILED",
      );
    }

    throw new AppError(
      "Failed to fetch nearby restaurants",
      500,
      "GOOGLE_PLACES_FAILED",
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Unable to fetch nearby restaurants at the moment",
      500,
      "GOOGLE_PLACES_REQUEST_ERROR",
    );
  }
}
