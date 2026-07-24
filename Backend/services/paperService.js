import { v2 as cloudinary } from 'cloudinary';
import Paper from '../models/Paper.js';
import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import ApiError from '../utils/apiError.js';

// Configure Cloudinary dynamically from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'examvault_papers',
        format: 'pdf'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const uploadPaperService = async ({
  uploadedBy,
  departmentId,
  semester,
  section,
  subjectId,
  academicYear,
  paperYear,
  examType,
  fileBuffer
}) => {
  // Validate department existence
  const deptExists = await Department.findById(departmentId);
  if (!deptExists) {
    throw new ApiError(404, 'Referenced department not found.');
  }

  // Validate subject existence
  const subjectExists = await Subject.findById(subjectId);
  if (!subjectExists) {
    throw new ApiError(404, 'Referenced subject not found.');
  }

  // Query assigned faculty member for moderation routing
  const assignment = await FacultyAssignment.findOne({ subjectId });
  const assignedFacultyId = assignment ? assignment.facultyUserId : null;

  // Stream file buffer to Cloudinary CDN
  let cloudinaryResult;
  try {
    cloudinaryResult = await uploadToCloudinary(fileBuffer);
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new ApiError(502, 'Failed to upload PDF file to storage server. Please verify Cloudinary credentials.');
  }

  // Create paper DB record
  const paper = new Paper({
    uploadedBy,
    departmentId,
    semester,
    section,
    subjectId,
    academicYear,
    paperYear,
    examType,
    fileUrl: cloudinaryResult.secure_url,
    filePublicId: cloudinaryResult.public_id,
    assignedFacultyId
  });

  await paper.save();
  return paper;
};

// Retrieve paper details helper
export const getPaperByIdService = async (id) => {
  const paper = await Paper.findById(id)
    .populate('uploadedBy', 'fullName email')
    .populate('departmentId', 'deptCode deptName')
    .populate('subjectId', 'subjectCode subjectName')
    .populate('assignedFacultyId', 'fullName email');

  if (!paper) {
    throw new ApiError(404, 'Paper not found.');
  }
  return paper;
};
