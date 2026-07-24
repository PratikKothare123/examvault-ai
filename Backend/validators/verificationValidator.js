import ApiError from '../utils/apiError.js';
import { PAPER_STATUS } from '../constants/paper.constants.js';

export const validateVerifyAction = (req, res, next) => {
  const { action, rejectionReason } = req.body;

  if (!action) {
    return next(new ApiError(400, 'Action is required. Must be Approved or Rejected.'));
  }

  if (action !== PAPER_STATUS.APPROVED && action !== PAPER_STATUS.REJECTED) {
    return next(new ApiError(400, `Invalid action. Must be either '${PAPER_STATUS.APPROVED}' or '${PAPER_STATUS.REJECTED}'.`));
  }

  if (action === PAPER_STATUS.REJECTED) {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return next(new ApiError(400, 'A valid reason (minimum 10 characters) is required when rejecting a paper.'));
    }
  }

  next();
};

export const validatePaperId = (req, res, next) => {
  const { id } = req.params;
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return next(new ApiError(400, 'Invalid paper ID format.'));
  }
  next();
};
