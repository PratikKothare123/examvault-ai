import { uploadPaperService, getPaperByIdService } from '../services/paperService.js';
import { Readable } from 'node:stream';
import { v2 as cloudinary } from 'cloudinary';
import Paper from '../models/Paper.js';
import { sendResponse } from '../utils/responseFormatter.js';
import ApiError from '../utils/apiError.js';
import { ROLES, PAPER_STATUS } from '../constants/paper.constants.js';
import { buildPaperDownloadFileName } from '../utils/paperFileName.js';

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

    const isApproved = paper.status === PAPER_STATUS.APPROVED;
    const isUploader = (paper.uploadedBy?._id || paper.uploadedBy)?.toString() === req.user.userId;
    const isStaff = req.user.role === ROLES.FACULTY || req.user.role === ROLES.ADMIN;

    if (!isApproved && !isUploader && !isStaff) {
      throw new ApiError(403, 'Forbidden. Only faculty-verified approved papers can be downloaded.');
    }

    const isInline = req.query.inline === 'true';

    // Increment download metrics count only when downloaded as an attachment for approved papers
    if (isApproved && !isInline) {
      await Paper.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });
    }

    // Format standardized filename attachment header
    const fileName = buildPaperDownloadFileName(paper);

    let publicId = paper.filePublicId;
    if (!publicId && paper.fileUrl) {
      const match = paper.fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      if (match) publicId = match[1];
    }

    let storageResponse;
    if (publicId) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const downloadUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
        resource_type: 'image',
        type: 'upload'
      });
      storageResponse = await fetch(downloadUrl);
    }

    if (!storageResponse || !storageResponse.ok || !storageResponse.body) {
      storageResponse = await fetch(paper.fileUrl);
    }

    if (!storageResponse.ok || !storageResponse.body) {
      throw new ApiError(502, 'We can not open this file. Something went wrong while reading the stored PDF.');
    }

    const dispositionType = isInline ? 'inline' : 'attachment';
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    return Readable.fromWeb(storageResponse.body).pipe(res);
  } catch (error) {
    next(error);
  }
};
