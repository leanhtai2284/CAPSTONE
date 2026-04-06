import Joi from "joi";
import AppError from "../utils/appError.js";

const restaurantQuerySchema = Joi.object({
  recipe_id: Joi.string().trim().required(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  intent: Joi.string().valid("recipe", "eat-out").optional(),
  diet_tag: Joi.string().trim().max(60).optional(),
});

export function validateRestaurantQuery(req, _res, next) {
  const { error, value } = restaurantQuerySchema.validate(req.query, {
    abortEarly: false,
    convert: true,
    allowUnknown: true,
    stripUnknown: false,
  });

  if (error) {
    const message = error.details.map((item) => item.message).join(", ");
    return next(new AppError(message, 400, "VALIDATION_ERROR"));
  }

  req.validatedQuery = value;
  return next();
}
