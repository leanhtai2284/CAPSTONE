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

    let descriptor = null;
    let target = req;

    while (target && !descriptor) {
      descriptor = Object.getOwnPropertyDescriptor(target, property);
      target = Object.getPrototypeOf(target);
    }

    const canAssign = descriptor
      ? Boolean(descriptor.writable || descriptor.set)
      : true;

    if (canAssign) {
      req[property] = value;
      return next();
    }

    if (req[property] && typeof req[property] === "object") {
      Object.assign(req[property], value);
      return next();
    }

    req.validated = req.validated || {};
    req.validated[property] = value;
    return next();
  };
}
