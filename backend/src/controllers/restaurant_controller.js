import asyncHandler from "../middlewares/asyncHandler.js";
import { getRestaurantsByDish } from "../services/restaurant_service.js";

export const getRestaurantsByDishController = asyncHandler(async (req, res) => {
  const { recipe_id: recipeId, lat, lng } = req.validatedQuery || req.query;

  const result = await getRestaurantsByDish({
    recipeId,
    lat: Number(lat),
    lng: Number(lng),
  });

  res.status(200).json(result);
});
