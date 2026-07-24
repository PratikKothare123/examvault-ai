import ApiError from '../utils/apiError.js';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error via Winston
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: err.stack,
    statusCode: err.statusCode || 500
  });

  // Mongoose CastError (Invalid ObjectId parameter)
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid ID format for field '${err.path}'.`;
    error = new ApiError(400, message);
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(400, message);
  }

  // MongoServerError Duplicate Key Code 11000
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Resource conflict. Duplicate value entered for '${field}'.`;
    error = new ApiError(409, message);
  }

  // JWT Token Errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token. Please log in again.');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token expired. Please log in again.');
  }

  const statusCode = error.statusCode || 500;
  const responseMessage = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: responseMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export default errorHandler;
