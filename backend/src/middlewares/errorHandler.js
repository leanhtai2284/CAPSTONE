export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = Number(err.statusCode) || 500;
  const safeMessage =
    statusCode >= 500
      ? "Internal Server Error"
      : err.message || "Request failed";

  if (statusCode >= 500) {
    console.error("[errorHandler]", err);
  }

  return res.status(statusCode).json({
    error: safeMessage,
    code: err.code || "INTERNAL_ERROR",
  });
}
