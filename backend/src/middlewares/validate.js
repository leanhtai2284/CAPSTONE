import AppError from "../utils/appError.js";

export function validate(schema, property = "body") {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      convert: true,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((item) => item.message).join(", ");
      return next(new AppError(message, 400, "VALIDATION_ERROR"));
    }

    req[property] = value;
    return next();
  };
}
