import Paper from '../models/Paper.js';
import Subject from '../models/Subject.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import { PAPER_STATUS } from '../constants/paper.constants.js';

export const getPendingPapersForFacultyService = async (facultyUserId) => {
  // Check assigned subjects via Subject.assignedFaculty array & legacy FacultyAssignment model
  const [assignedSubjects, legacyAssignments] = await Promise.all([
    Subject.find({ assignedFaculty: facultyUserId }).select('_id'),
    FacultyAssignment.find({ facultyUserId }).select('subjectId')
  ]);

  const subjectIds = [
    ...assignedSubjects.map(s => s._id),
    ...legacyAssignments.map(a => a.subjectId)
  ];

  // If no subjects specifically assigned, fallback to faculty department papers
  const facultyUser = await User.findById(facultyUserId);
  const query = { status: PAPER_STATUS.PENDING };
  
  if (subjectIds.length > 0) {
    query.subjectId = { $in: subjectIds };
  } else if (facultyUser && facultyUser.department) {
    query.departmentId = facultyUser.department;
  }

  return await Paper.find(query)
    .populate('uploadedBy', 'fullName email reputationPoints')
    .populate('subjectId', 'subjectCode subjectName semester')
    .populate('departmentId', 'deptCode deptName')
    .sort({ createdAt: 1 });
};

export const getApprovedPapersForFacultyService = async (facultyUserId) => {
  const [assignedSubjects, legacyAssignments] = await Promise.all([
    Subject.find({ assignedFaculty: facultyUserId }).select('_id'),
    FacultyAssignment.find({ facultyUserId }).select('subjectId')
  ]);

  const subjectIds = [
    ...assignedSubjects.map(s => s._id),
    ...legacyAssignments.map(a => a.subjectId)
  ];

  const facultyUser = await User.findById(facultyUserId);
  const query = { status: PAPER_STATUS.APPROVED };

  if (subjectIds.length > 0) {
    query.subjectId = { $in: subjectIds };
  } else if (facultyUser && facultyUser.department) {
    query.departmentId = facultyUser.department;
  }

  return await Paper.find(query)
    .populate('uploadedBy', 'fullName email reputationPoints')
    .populate('subjectId', 'subjectCode subjectName semester')
    .populate('departmentId', 'deptCode deptName')
    .sort({ updatedAt: -1 });
};

export const verifyPaperService = async (paperId, facultyUserId, { action, rejectionReason, comments }) => {
  const paper = await Paper.findById(paperId);
  if (!paper) {
    throw new ApiError(404, 'Paper not found.');
  }

  if (paper.status !== PAPER_STATUS.PENDING) {
    throw new ApiError(400, 'This paper has already been processed and its state is locked.');
  }

  const facultyUser = await User.findById(facultyUserId);
  await paper.populate('subjectId', 'subjectCode subjectName');

  paper.verifiedBy = facultyUserId;
  paper.verifiedAt = new Date();

  if (action === PAPER_STATUS.APPROVED) {
    paper.status = PAPER_STATUS.APPROVED;
    paper.rejectionReason = null;
    paper.verificationComments = comments ? comments.trim() : 'Verified from official department copy.';

    // Award +10 Reputation Points to Student Uploader
    await User.findByIdAndUpdate(paper.uploadedBy, {
      $inc: { reputationPoints: 10 }
    });

    await Notification.create({
      recipientId: paper.uploadedBy,
      paperId: paper._id,
      type: 'PAPER_APPROVED',
      message: `Your question paper for ${paper.subjectId.subjectName} (${paper.subjectId.subjectCode}) ${paper.examType} ${paper.academicYear} has been approved by ${facultyUser?.fullName || 'Faculty'}.`
    });

  } else if (action === PAPER_STATUS.REJECTED) {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      throw new ApiError(400, 'Structured rejection feedback must contain at least 10 characters.');
    }

    paper.status = PAPER_STATUS.REJECTED;
    paper.rejectionReason = rejectionReason.trim();
    paper.verificationComments = comments ? comments.trim() : '';

    await Notification.create({
      recipientId: paper.uploadedBy,
      paperId: paper._id,
      type: 'PAPER_REJECTED',
      message: `Your submission for ${paper.subjectId.subjectName} (${paper.subjectId.subjectCode}) was rejected: "${rejectionReason.trim()}".`
    });
  } else {
    throw new ApiError(400, 'Invalid verification action. Must be Approved or Rejected.');
  }

  await paper.save();
  return paper;
};
