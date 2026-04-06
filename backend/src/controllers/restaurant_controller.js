import asyncHandler from "../middlewares/asyncHandler.js";
import { getRestaurantsByDish } from "../services/restaurant_service.js";

export const getRestaurantsByDishController = asyncHandler(async (req, res) => {
  const {
    recipe_id: recipeId,
    lat,
    lng,
    intent,
    diet_tag: dietTag,
  } = req.validatedQuery || req.query;

  const result = await getRestaurantsByDish({
    recipeId,
    lat: Number(lat),
    lng: Number(lng),
    intent,
    dietTag,
  });

  res.status(200).json(result);
});
