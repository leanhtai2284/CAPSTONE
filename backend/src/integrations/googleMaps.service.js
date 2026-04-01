import axios from "axios";
import AppError from "../utils/appError.js";

const placesClient = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api/place",
  timeout: 8000,
});

const placesNewClient = axios.create({
  baseURL: "https://places.googleapis.com/v1",
  timeout: 8000,
});

const ERROR_STATUSES = new Set([
  "OVER_QUERY_LIMIT",
  "REQUEST_DENIED",
  "INVALID_REQUEST",
  "UNKNOWN_ERROR",
]);

async function searchWithPlacesApiNew({ lat, lng, keyword, radius, apiKey }) {
  const response = await placesNewClient.post(
    "/places:searchText",
    {
      textQuery: `${keyword} restaurant`,
      languageCode: "vi",
      locationBias: {
        circle: {
          center: {
            latitude: Number(lat),
            longitude: Number(lng),
          },
          radius: Number(radius),
        },
      },
    },
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.rating,places.location",
      },
    },
  );

  const places = response.data?.places || [];

  return places.map((item) => ({
    name: item?.displayName?.text || "Unknown",
    vicinity: item?.formattedAddress || "Unknown",
    rating: item?.rating,
    geometry: {
      location: {
        lat: item?.location?.latitude,
        lng: item?.location?.longitude,
      },
    },
  }));
}

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

    if (
      payload.status === "REQUEST_DENIED" &&
      String(payload.error_message || "")
        .toLowerCase()
        .includes("legacy api")
    ) {
      return await searchWithPlacesApiNew({
        lat,
        lng,
        keyword,
        radius,
        apiKey,
      });
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

    const providerStatus =
      error?.response?.data?.error?.status || error?.response?.data?.status;

    if (
      providerStatus === "PERMISSION_DENIED" ||
      providerStatus === "REQUEST_DENIED"
    ) {
      throw new AppError(
        "Google Places API is not enabled or not authorized",
        500,
        "GOOGLE_PLACES_DISABLED",
      );
    }

    throw new AppError(
      "Unable to fetch nearby restaurants at the moment",
      500,
      "GOOGLE_PLACES_REQUEST_ERROR",
    );
  }
}
