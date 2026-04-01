import express from "express";
import { getRestaurantsByDishController } from "../controllers/restaurant_controller.js";
import { restaurantRecommendationLimiter } from "../middlewares/rateLimiter.js";
import { validateRestaurantQuery } from "../middlewares/restaurantValidation.js";

const router = express.Router();

router.get(
  "/restaurants-by-dish",
  restaurantRecommendationLimiter,
  validateRestaurantQuery,
  getRestaurantsByDishController,
);

export default router;
