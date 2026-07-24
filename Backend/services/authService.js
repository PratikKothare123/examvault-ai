import User from '../models/User.js';
import Department from '../models/Department.js';
import ApiError from '../utils/apiError.js';
import jwt from 'jsonwebtoken';
import { ROLES } from '../constants/paper.constants.js';

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'pratik_kothare123',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

export const registerUser = async ({ fullName, email, password, role, department }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists.');
  }

  const targetRole = role || ROLES.STUDENT;

  // Resolve Department ObjectId if department code is passed as string (e.g. 'CSE')
  let resolvedDeptId = department;
  if (targetRole !== ROLES.ADMIN && department) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(department);
    if (!isObjectId) {
      const foundDept = await Department.findOne({ deptCode: department.toUpperCase().trim() });
      if (foundDept) {
        resolvedDeptId = foundDept._id;
      } else {
        const firstDept = await Department.findOne();
        resolvedDeptId = firstDept ? firstDept._id : undefined;
      }
    }
  }

  // Create new user
  const user = new User({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: targetRole,
    department: targetRole === ROLES.ADMIN ? undefined : resolvedDeptId
  });

  await user.save();

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      reputationPoints: user.reputationPoints || 0
    }
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      reputationPoints: user.reputationPoints || 0
    }
  };
};
