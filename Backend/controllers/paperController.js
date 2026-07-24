import { uploadPaperService, getPaperByIdService } from '../services/paperService.js';
import Paper from '../models/Paper.js';
import { sendResponse } from '../utils/responseFormatter.js';
import ApiError from '../utils/apiError.js';
import { ROLES, PAPER_STATUS } from '../constants/paper.constants.js';

export const uploadPaper = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Please attach a PDF file to upload.');
    }

    const { departmentId, semester, section, subjectId, academicYear, paperYear, examType } = req.body;
    const uploadedBy = req.user.userId;
    const fileBuffer = req.file.buffer;

    const paper = await uploadPaperService({
      uploadedBy,
      departmentId,
      semester,
      section,
      subjectId,
      academicYear,
      paperYear,
      examType,
      fileBuffer
    });

    return sendResponse(res, 201, 'Paper uploaded successfully and is pending faculty verification.', { paper });
  } catch (error) {
    next(error);
  }
};

export const getPaperDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paper = await getPaperByIdService(id);

    // Students are only allowed to see details of papers they personally uploaded unless it is approved
    if (req.user.role === ROLES.STUDENT && paper.uploadedBy._id.toString() !== req.user.userId && paper.status !== PAPER_STATUS.APPROVED) {
      throw new ApiError(403, 'Forbidden. You are not authorized to access this document record.');
    }

    return sendResponse(res, 200, 'Paper details fetched successfully', { paper });
  } catch (error) {
    next(error);
  }
};

export const downloadPaper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paper = await getPaperByIdService(id);

    // Enforce status constraint: Only Approved papers can be downloaded publicly
    if (paper.status !== PAPER_STATUS.APPROVED) {
      throw new ApiError(403, 'Forbidden. Only faculty-verified approved papers can be downloaded.');
    }

    // Increment download metrics count
    await Paper.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });

    // Format standardized filename attachment header
    const subjectCode = paper.subjectId?.subjectCode || 'PAPER';
    const fileName = `${subjectCode}_${paper.examType}_${paper.paperYear}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    return res.redirect(paper.fileUrl);
  } catch (error) {
    next(error);
  }
};
