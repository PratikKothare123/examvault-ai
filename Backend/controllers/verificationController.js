import { 
  getPendingPapersForFacultyService, 
  getApprovedPapersForFacultyService, 
  verifyPaperService 
} from '../services/verificationService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { PAPER_STATUS } from '../constants/paper.constants.js';

export const getPendingQueue = async (req, res, next) => {
  try {
    const papers = await getPendingPapersForFacultyService(req.user.userId);
    return sendResponse(res, 200, 'Pending papers queue fetched successfully', { papers });
  } catch (error) {
    next(error);
  }
};

export const getApprovedHistory = async (req, res, next) => {
  try {
    const papers = await getApprovedPapersForFacultyService(req.user.userId);
    return sendResponse(res, 200, 'Approved papers history fetched successfully', { papers });
  } catch (error) {
    next(error);
  }
};

export const verifyPaper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;
    const paper = await verifyPaperService(id, req.user.userId, { action, rejectionReason });
    const successMsg = action === PAPER_STATUS.APPROVED ? 'Paper approved successfully' : 'Paper rejected successfully';
    return sendResponse(res, 200, successMsg, { paper });
  } catch (error) {
    next(error);
  }
};
