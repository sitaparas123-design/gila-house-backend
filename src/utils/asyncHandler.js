/**
 * Wraps async express routes to catch any errors and pass them to the global error handler
 * This prevents the server from crashing on unhandled promise rejections
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
