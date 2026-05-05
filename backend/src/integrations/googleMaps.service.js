import axios from "axios";
import AppError from "../utils/appError.js";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

const nominatimClient = axios.create({
  baseURL: "https://nominatim.openstreetmap.org",
  timeout: 12000,
  headers: {
    "User-Agent": "smartmeal/1.0",
  },
});

const photonClient = axios.create({
  baseURL: "https://photon.komoot.io",
  timeout: 12000,
});

const SEARCH_AMENITIES = "restaurant|fast_food|cafe";

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseElementLocation(element) {
  const lat = Number(element?.lat ?? element?.center?.lat);
  const lng = Number(element?.lon ?? element?.center?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

function parseAddress(tags = {}) {
  const full = tags["addr:full"];
  if (full) return full;

  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
  ].filter(Boolean);

  if (parts.length) return parts.join(", ");
  return tags["addr:place"] || tags["addr:district"] || "Unknown";
}

function toGoogleLikeResult(element) {
  const location = parseElementLocation(element);
  if (!location) return null;

  const tags = element?.tags || {};
  const id = `${element?.type || "node"}-${element?.id || "unknown"}`;
  const searchableText = [
    tags.name,
    tags["name:vi"],
    tags.cuisine,
    tags.amenity,
    parseAddress(tags),
  ]
    .filter(Boolean)
    .join(" ");

  return {
    place_id: id,
    name: tags.name || "Unknown",
    vicinity: parseAddress(tags),
    // Overpass does not provide ratings.
    rating: 0,
    geometry: {
      location,
    },
    _cuisine: tags.cuisine || "",
    _searchable_text: searchableText,
  };
}

function buildOverpassQuery({ lat, lng, radius, keyword }) {
  const safeLat = Number(lat);
  const safeLng = Number(lng);
  const safeRadius = Math.max(500, Math.min(5000, Number(radius) || 3000));
  const escapedKeyword = escapeRegex(keyword);
  const hasKeyword = Boolean(String(keyword || "").trim());

  const keywordFilters = hasKeyword
    ? `
      [~"name|name:vi|cuisine"~"${escapedKeyword}",i]
    `
    : "";

  return `
[out:json][timeout:25];
(
  node["amenity"~"${SEARCH_AMENITIES}"]${keywordFilters}(around:${safeRadius},${safeLat},${safeLng});
  way["amenity"~"${SEARCH_AMENITIES}"]${keywordFilters}(around:${safeRadius},${safeLat},${safeLng});
  relation["amenity"~"${SEARCH_AMENITIES}"]${keywordFilters}(around:${safeRadius},${safeLat},${safeLng});
);
out center tags;
`;
}

function toNominatimResult(item) {
  const lat = Number(item?.lat);
  const lng = Number(item?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const searchableText = [item?.name, item?.display_name, item?.type]
    .filter(Boolean)
    .join(" ");

  return {
    place_id: `${item?.osm_type || "node"}-${item?.osm_id || "unknown"}`,
    name: item?.name || String(item?.display_name || "Unknown").split(",")[0],
    vicinity: item?.display_name || "Unknown",
    rating: 0,
    geometry: {
      location: { lat, lng },
    },
    _cuisine: item?.type || "",
    _searchable_text: searchableText,
  };
}

function toPhotonResult(feature) {
  const coordinates = feature?.geometry?.coordinates;
  const lng = Number(coordinates?.[0]);
  const lat = Number(coordinates?.[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const p = feature?.properties || {};
  const name = p?.name || "Unknown";
  const address = [p?.housenumber, p?.street, p?.district, p?.city, p?.country]
    .filter(Boolean)
    .join(", ");
  const searchableText = [
    p?.name,
    p?.street,
    p?.district,
    p?.city,
    p?.osm_key,
    p?.osm_value,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    place_id: `${p?.osm_type || "node"}-${p?.osm_id || "unknown"}`,
    name,
    vicinity: address || "Unknown",
    rating: 0,
    geometry: {
      location: { lat, lng },
    },
    _cuisine: p?.osm_value || "",
    _searchable_text: searchableText,
  };
}

async function searchWithPhoton({ lat, lng, keyword }) {
  const query = String(keyword || "").trim() || "restaurant";
  const response = await photonClient.get("/api/", {
    params: {
      q: query,
      lat: Number(lat),
      lon: Number(lng),
      limit: 30,
    },
    headers: {
      "User-Agent": "smartmeal/1.0",
    },
  });

  const features = Array.isArray(response?.data?.features)
    ? response.data.features
    : [];

  const filtered = features.filter((feature) => {
    const key = String(feature?.properties?.osm_key || "").toLowerCase();
    const value = String(feature?.properties?.osm_value || "").toLowerCase();
    return (
      key === "amenity" && ["restaurant", "fast_food", "cafe"].includes(value)
    );
  });

  return filtered.map(toPhotonResult).filter(Boolean);
}

async function searchWithNominatim({ lat, lng, keyword, radius }) {
  const safeLat = Number(lat);
  const safeLng = Number(lng);
  const safeRadius = Math.max(500, Math.min(5000, Number(radius) || 3000));

  const latDelta = safeRadius / 111320;
  const lngDelta =
    safeRadius / (111320 * Math.max(Math.cos((safeLat * Math.PI) / 180), 0.1));

  const viewbox = `${safeLng - lngDelta},${safeLat + latDelta},${safeLng + lngDelta},${safeLat - latDelta}`;
  const primaryQuery = String(keyword || "").trim()
    ? `${keyword} near ${safeLat},${safeLng}`
    : `restaurant near ${safeLat},${safeLng}`;

  const requestSearch = async (q) => {
    const response = await nominatimClient.get("/search", {
      params: {
        q,
        format: "jsonv2",
        limit: 30,
        bounded: 1,
        viewbox,
      },
    });

    const items = Array.isArray(response?.data) ? response.data : [];
    return items.map(toNominatimResult).filter(Boolean);
  };

  const primaryResults = await requestSearch(primaryQuery);
  if (primaryResults.length > 0) {
    return primaryResults;
  }

  if (String(keyword || "").trim()) {
    return await requestSearch(`restaurant near ${safeLat},${safeLng}`);
  }

  return [];
}

async function executeOverpassQuery(query) {
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await axios.get(endpoint, {
        timeout: 12000,
        params: { data: query },
        headers: {
          "User-Agent": "smartmeal/1.0",
        },
      });

      const elements = Array.isArray(response?.data?.elements)
        ? response.data.elements
        : [];

      return elements;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Overpass request failed");
}

export async function searchNearbyRestaurants({
  lat,
  lng,
  keyword,
  radius = 3000,
}) {
  try {
    let elements = [];

    try {
      const query = buildOverpassQuery({ lat, lng, radius, keyword });
      elements = await executeOverpassQuery(query);

      if (elements.length === 0 && String(keyword || "").trim()) {
        const broadQuery = buildOverpassQuery({
          lat,
          lng,
          radius,
          keyword: "",
        });
        elements = await executeOverpassQuery(broadQuery);
      }
    } catch (_overpassError) {
      // Fall back to Photon/Nominatim when Overpass is unavailable.
      const photonResults = await searchWithPhoton({ lat, lng, keyword });
      if (photonResults.length > 0) {
        return photonResults;
      }

      const nominatimResults = await searchWithNominatim({
        lat,
        lng,
        keyword,
        radius,
      });
      return nominatimResults;
    }

    const overpassResults = elements.map(toGoogleLikeResult).filter(Boolean);

    if (overpassResults.length > 0) {
      return overpassResults;
    }

    const photonResults = await searchWithPhoton({ lat, lng, keyword });
    if (photonResults.length > 0) {
      return photonResults;
    }

    return await searchWithNominatim({ lat, lng, keyword, radius });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "OpenStreetMap provider is unavailable at the moment",
      500,
      "OSM_OVERPASS_FAILED",
    );
  }
}
