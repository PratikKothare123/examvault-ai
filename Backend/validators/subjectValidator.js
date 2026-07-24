import ApiError from '../utils/apiError.js';
import { SEMESTERS } from '../constants/paper.constants.js';

export const validateCreateSubject = (req, res, next) => {
  const { subjectCode, subjectName, departmentId, semester } = req.body;

  if (!subjectCode || subjectCode.trim().length < 2 || subjectCode.trim().length > 15) {
    return next(new ApiError(400, 'Subject code is required and must be between 2 and 15 characters.'));
  }

  if (!subjectName || subjectName.trim().length < 3 || subjectName.trim().length > 100) {
    return next(new ApiError(400, 'Subject name is required and must be between 3 and 100 characters.'));
  }

  if (!departmentId) {
    return next(new ApiError(400, 'Department ID reference is required.'));
  }
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(departmentId)) {
    return next(new ApiError(400, 'Invalid department ID format.'));
  }

  if (!semester) {
    return next(new ApiError(400, 'Semester designation is required.'));
  }
  if (!SEMESTERS.includes(semester)) {
    return next(new ApiError(400, 'Invalid semester value. Must be standard semester designation.'));
  }

  next();
};

export const validateUpdateSubject = (req, res, next) => {
  const { subjectCode, subjectName, departmentId, semester } = req.body;

  if (subjectCode !== undefined && (subjectCode.trim().length < 2 || subjectCode.trim().length > 15)) {
    return next(new ApiError(400, 'Subject code must be between 2 and 15 characters if provided.'));
  }

  if (subjectName !== undefined && (subjectName.trim().length < 3 || subjectName.trim().length > 100)) {
    return next(new ApiError(400, 'Subject name must be between 3 and 100 characters if provided.'));
  }

  if (departmentId !== undefined) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(departmentId)) {
      return next(new ApiError(400, 'Invalid department ID format.'));
    }
  }

  if (semester !== undefined && !SEMESTERS.includes(semester)) {
    return next(new ApiError(400, 'Invalid semester value. Must be standard semester designation.'));
  }

  if (subjectCode === undefined && subjectName === undefined && departmentId === undefined && semester === undefined) {
    return next(new ApiError(400, 'Please provide at least one subject field to update.'));
  }

  next();
};

export const validateSubjectId = (req, res, next) => {
  const { id } = req.params;
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return next(new ApiError(400, 'Invalid subject ID format.'));
  }
  next();
};
