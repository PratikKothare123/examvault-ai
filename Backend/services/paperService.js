import { v2 as cloudinary } from 'cloudinary';
import Paper from '../models/Paper.js';
import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import { ROLES } from '../constants/paper.constants.js';

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

const uploadToCloudinary = (fileBuffer) => {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'examvault_papers', format: 'pdf' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const uploadPaperService = async ({
  uploadedBy, departmentId, semester, section, subjectId,
  academicYear, paperYear, examType, fileBuffer
}) => {
  const deptExists = await Department.findById(departmentId);
  if (!deptExists) throw new ApiError(404, 'Referenced department not found.');

  const subjectExists = await Subject.findById(subjectId);
  if (!subjectExists) throw new ApiError(404, 'Referenced subject not found.');
  if (subjectExists.departmentId.toString() !== departmentId.toString()) {
    throw new ApiError(400, 'Selected subject does not belong to the selected department.');
  }
  if (subjectExists.semester !== semester) {
    throw new ApiError(400, 'Selected subject does not belong to the selected semester.');
  }

  const subjectObj = await Subject.findById(subjectId).populate('assignedFaculty', '_id');
  let assignedFacultyIds = [];

  if (subjectObj && subjectObj.assignedFaculty && subjectObj.assignedFaculty.length > 0) {
    assignedFacultyIds = subjectObj.assignedFaculty.map(f => f._id.toString());
  }

  const legacyAssignments = await FacultyAssignment.find({ subjectId }).populate('facultyUserId', '_id');
  legacyAssignments.forEach(a => {
    if (a.facultyUserId && !assignedFacultyIds.includes(a.facultyUserId._id.toString())) {
      assignedFacultyIds.push(a.facultyUserId._id.toString());
    }
  });

  const assignedFacultyId = assignedFacultyIds.length > 0 ? assignedFacultyIds[0] : null;

  let cloudinaryResult;
  try {
    cloudinaryResult = await uploadToCloudinary(fileBuffer);
  } catch (error) {
    throw new ApiError(502, 'Failed to upload PDF file to storage server. Please verify Cloudinary credentials.');
  }

  const paper = new Paper({
    uploadedBy, departmentId, semester, section, subjectId,
    academicYear, paperYear, examType,
    fileUrl: cloudinaryResult.secure_url,
    filePublicId: cloudinaryResult.public_id,
    assignedFacultyId
  });

  await paper.save();

  const popPaper = await Paper.findById(paper._id)
    .populate('subjectId', 'subjectCode subjectName')
    .populate('uploadedBy', 'fullName');

  const subjectName = popPaper?.subjectId?.subjectName || subjectExists.subjectName;
  const subjectCode = popPaper?.subjectId?.subjectCode || '';

  if (assignedFacultyIds.length > 0) {
    const facultyNotifications = assignedFacultyIds.map(facId => ({
      recipientId: facId, senderId: uploadedBy, paperId: paper._id, type: 'NEW_PENDING_PAPER',
      message: `A new question paper for ${subjectName} (${subjectCode}) ${examType} has been uploaded by ${popPaper?.uploadedBy?.fullName || 'a student'}. Please review and verify.`
    }));
    await Notification.insertMany(facultyNotifications);
  } else {
    const admins = await User.find({ role: ROLES.ADMIN }).select('_id');
    if (admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        recipientId: admin._id, senderId: uploadedBy, paperId: paper._id, type: 'NO_FACULTY_ASSIGNED',
        message: `Subject "${subjectName} (${subjectCode})" has no assigned faculty. A new paper was uploaded but no faculty can verify it. Please assign a faculty member.`
      }));
      await Notification.insertMany(adminNotifications);
    }
  }

  return paper;
};

export const getPaperByIdService = async (id) => {
  const paper = await Paper.findById(id)
    .populate('uploadedBy', 'fullName email')
    .populate('departmentId', 'deptCode deptName')
    .populate('subjectId', 'subjectCode subjectName')
    .populate('assignedFacultyId', 'fullName email');

  if (!paper) throw new ApiError(404, 'Paper not found.');
  return paper;
};
