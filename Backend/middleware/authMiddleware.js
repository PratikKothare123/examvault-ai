import jwt from 'jsonwebtoken';
import ApiError from '../utils/apiError.js';

export const requireAuth = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next(new ApiError(401, 'Authentication token missing or invalid. Please login again.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Authentication token expired or invalid. Please login again.'));
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'User session not initialized.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden. You do not have permissions to perform this action.'));
    }
    next();
  };
};
