import ApiError from '../utils/apiError.js';
import { SEMESTERS, PAPER_TYPES } from '../constants/paper.constants.js';

export const validatePaperMetadata = (req, res, next) => {
  const { departmentId, semester, subjectId, academicYear, examType } = req.body;

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!departmentId) {
    return next(new ApiError(400, 'Department ID reference is required.'));
  }
  if (!objectIdRegex.test(departmentId)) {
    return next(new ApiError(400, 'Invalid department ID format.'));
  }

  if (!semester) {
    return next(new ApiError(400, 'Semester designation is required.'));
  }
  if (!SEMESTERS.includes(semester)) {
    return next(new ApiError(400, 'Invalid semester value.'));
  }

  if (!subjectId) {
    return next(new ApiError(400, 'Subject ID reference is required.'));
  }
  if (!objectIdRegex.test(subjectId)) {
    return next(new ApiError(400, 'Invalid subject ID format.'));
  }

  if (!academicYear) {
    return next(new ApiError(400, 'Academic year is required.'));
  }

  if (!examType) {
    return next(new ApiError(400, 'Exam type designation is required.'));
  }
  if (!PAPER_TYPES.includes(examType)) {
    return next(new ApiError(400, 'Invalid exam type value. Must be CAE-I, CAE-II, or ESE.'));
  }

  next();
};
