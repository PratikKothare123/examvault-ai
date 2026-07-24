import ApiError from '../utils/apiError.js';

export const validateCreateDept = (req, res, next) => {
  const { deptCode, deptName } = req.body;

  if (!deptCode || deptCode.trim().length < 2 || deptCode.trim().length > 10) {
    return next(new ApiError(400, 'Department code is required and must be between 2 and 10 characters.'));
  }

  if (!deptName || deptName.trim().length < 3 || deptName.trim().length > 100) {
    return next(new ApiError(400, 'Department name is required and must be between 3 and 100 characters.'));
  }

  next();
};

export const validateUpdateDept = (req, res, next) => {
  const { deptCode, deptName } = req.body;

  if (deptCode !== undefined && (deptCode.trim().length < 2 || deptCode.trim().length > 10)) {
    return next(new ApiError(400, 'Department code must be between 2 and 10 characters if provided.'));
  }

  if (deptName !== undefined && (deptName.trim().length < 3 || deptName.trim().length > 100)) {
    return next(new ApiError(400, 'Department name must be between 3 and 100 characters if provided.'));
  }

  if (deptCode === undefined && deptName === undefined) {
    return next(new ApiError(400, 'Please provide either deptCode or deptName to update.'));
  }

  next();
};

export const validateDeptId = (req, res, next) => {
  const { id } = req.params;
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return next(new ApiError(400, 'Invalid department ID format.'));
  }
  next();
};
