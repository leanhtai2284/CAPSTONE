import axiosInstance from "./axiosInstance";

const FALLBACK_LOCATION = {
  lat: 10.7769,
  lng: 106.7009,
};

function resolveRecipeId(meal) {
  return meal?._id || meal?.id || meal?.recipe_id || "";
}

export async function fetchRestaurantsByDish({
  meal,
  lat,
  lng,
  intent = "eat-out",
}) {
  const recipeId = resolveRecipeId(meal);
  if (!recipeId) {
    throw new Error("Không tìm thấy ID món ăn để tìm quán.");
  }

  const safeLat = Number.isFinite(Number(lat))
    ? Number(lat)
    : FALLBACK_LOCATION.lat;
  const safeLng = Number.isFinite(Number(lng))
    ? Number(lng)
    : FALLBACK_LOCATION.lng;

  const params = {
    recipe_id: recipeId,
    lat: safeLat,
    lng: safeLng,
    intent,
  };

  if (meal?.diet_tags?.[0]) {
    params.diet_tag = String(meal.diet_tags[0]);
  }

  const { data } = await axiosInstance.get("/restaurants-by-dish", { params });
  return data;
}

export { FALLBACK_LOCATION };
