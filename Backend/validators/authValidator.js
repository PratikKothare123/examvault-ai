import ApiError from '../utils/apiError.js';
import { ROLES } from '../constants/paper.constants.js';

export const validateRegister = (req, res, next) => {
  const { fullName, email, password, role, department } = req.body;

  if (!fullName || fullName.trim().length < 2 || fullName.trim().length > 50) {
    return next(new ApiError(400, 'Full name must be between 2 and 50 characters.'));
  }

  if (!email) {
    return next(new ApiError(400, 'Email is required.'));
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@sbjit\.edu\.in$/;
  if (!emailRegex.test(email.trim())) {
    return next(new ApiError(422, 'Only official college email addresses (@sbjit.edu.in) are allowed.'));
  }

  if (!password || password.length < 6) {
    return next(new ApiError(400, 'Password must be at least 6 characters long.'));
  }

  const targetRole = role || ROLES.STUDENT;
  if (!Object.values(ROLES).includes(targetRole)) {
    return next(new ApiError(400, 'Invalid user role.'));
  }

  if (targetRole !== ROLES.ADMIN) {
    if (!department) {
      return next(new ApiError(400, 'Department is required for Student and Faculty roles.'));
    }
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return next(new ApiError(400, 'Email is required.'));
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@sbjit\.edu\.in$/;
  if (!emailRegex.test(email.trim())) {
    return next(new ApiError(422, 'Only official college email addresses (@sbjit.edu.in) are allowed.'));
  }

  if (!password) {
    return next(new ApiError(400, 'Password is required.'));
  }

  next();
};
