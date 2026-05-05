export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function mapKnownError(err) {
  if (!err) return null;

  if (err.name === "ValidationError") {
    const details = Object.values(err.errors || {})
      .map((item) => item?.message)
      .filter(Boolean)
      .join(", ");

    return {
      statusCode: 400,
      message: details || "Validation failed",
      code: "VALIDATION_ERROR",
    };
  }

  if (err.name === "CastError") {
    return {
      statusCode: 400,
      message: `${err.path || "field"} is invalid`,
      code: "INVALID_VALUE",
    };
  }

  if (err?.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || err.keyValue || {})[0];
    return {
      statusCode: 409,
      message: duplicateField
        ? `${duplicateField} already exists`
        : "Duplicate value",
      code: "DUPLICATE_KEY",
    };
  }

  if (err.type === "entity.parse.failed") {
    return {
      statusCode: 400,
      message: "Invalid JSON body",
      code: "INVALID_JSON",
    };
  }

  return null;
}

export function errorHandler(err, _req, res, _next) {
  const mapped = mapKnownError(err);
  const statusCode = mapped?.statusCode || Number(err.statusCode) || 500;
  const safeMessage =
    mapped?.message ||
    (statusCode >= 500
      ? "Internal Server Error"
      : err.message || "Request failed");
  const code =
    mapped?.code ||
    err.code ||
    (statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");

  if (statusCode >= 500) {
    console.error("[errorHandler]", err);
  }

  return res.status(statusCode).json({
    error: safeMessage,
    code,
  });
}
