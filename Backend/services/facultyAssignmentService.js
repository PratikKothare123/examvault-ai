import FacultyAssignment from '../models/FacultyAssignment.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import ApiError from '../utils/apiError.js';
import { ROLES } from '../constants/paper.constants.js';

export const assignFacultyToSubjectService = async ({ facultyUserId, subjectId }) => {
  const user = await User.findById(facultyUserId);
  if (!user) {
    throw new ApiError(404, 'Referenced user not found.');
  }
  if (user.role !== ROLES.FACULTY) {
    throw new ApiError(400, 'User is not registered with a Faculty role.');
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, 'Referenced subject not found.');
  }

  const existingMapping = await FacultyAssignment.findOne({ facultyUserId, subjectId });
  if (existingMapping) {
    throw new ApiError(409, 'This Faculty member is already assigned to this subject.');
  }

  const assignment = new FacultyAssignment({
    facultyUserId,
    subjectId
  });

  await assignment.save();
  return assignment;
};

export const getAllFacultyAssignmentsService = async (filters = {}) => {
  const query = {};
  if (filters.facultyUserId) {
    query.facultyUserId = filters.facultyUserId;
  }
  if (filters.subjectId) {
    query.subjectId = filters.subjectId;
  }

  return await FacultyAssignment.find(query)
    .populate('facultyUserId', 'fullName email department')
    .populate({
      path: 'subjectId',
      select: 'subjectCode subjectName semester departmentId',
      populate: {
        path: 'departmentId',
        select: 'deptCode deptName'
      }
    });
};

export const getFacultySubjectsService = async (facultyUserId) => {
  const assignments = await FacultyAssignment.find({ facultyUserId })
    .populate({
      path: 'subjectId',
      select: 'subjectCode subjectName semester departmentId',
      populate: {
        path: 'departmentId',
        select: 'deptCode deptName'
      }
    });

  return assignments.map(assign => assign.subjectId).filter(subj => subj !== null);
};

export const deleteFacultyAssignmentService = async (id) => {
  const assignment = await FacultyAssignment.findById(id);
  if (!assignment) {
    throw new ApiError(404, 'Faculty assignment mapping not found.');
  }

  await FacultyAssignment.findByIdAndDelete(id);
  return true;
};
