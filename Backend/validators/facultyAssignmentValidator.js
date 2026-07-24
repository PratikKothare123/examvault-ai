import ApiError from '../utils/apiError.js';

export const validateCreateAssignment = (req, res, next) => {
  const { facultyUserId, subjectId } = req.body;

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!facultyUserId) {
    return next(new ApiError(400, 'Faculty user ID reference is required.'));
  }
  if (!objectIdRegex.test(facultyUserId)) {
    return next(new ApiError(400, 'Invalid faculty user ID format.'));
  }

  if (!subjectId) {
    return next(new ApiError(400, 'Subject ID reference is required.'));
  }
  if (!objectIdRegex.test(subjectId)) {
    return next(new ApiError(400, 'Invalid subject ID format.'));
  }

  next();
};

export const validateAssignmentId = (req, res, next) => {
  const { id } = req.params;
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return next(new ApiError(400, 'Invalid assignment ID format.'));
  }
  next();
};
