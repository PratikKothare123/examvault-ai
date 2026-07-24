import { registerUser, loginUser } from '../services/authService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, department } = req.body;
    const data = await registerUser({ fullName, email, password, role, department });
    return sendResponse(res, 201, 'User registered successfully', data);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser({ email, password });
    return sendResponse(res, 200, 'Login successful', data);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password').populate('department', 'deptName deptCode');
    if (!user) {
      return next(new ApiError(404, 'User not found.'));
    }
    return sendResponse(res, 200, 'User profile fetched successfully', { user });
  } catch (error) {
    next(error);
  }
};
