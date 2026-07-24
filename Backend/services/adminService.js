import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import User from '../models/User.js';
import Paper from '../models/Paper.js';
import ApiError from '../utils/apiError.js';
import { ROLES, PAPER_STATUS } from '../constants/paper.constants.js';

export const getAdminStatsService = async () => {
  const departmentsCount = await Department.countDocuments();
  const subjectsCount = await Subject.countDocuments();
  const facultyMappingsCount = await FacultyAssignment.countDocuments();

  const totalUsers = await User.countDocuments();
  const studentsCount = await User.countDocuments({ role: ROLES.STUDENT });
  const facultyCount = await User.countDocuments({ role: ROLES.FACULTY });
  const adminsCount = await User.countDocuments({ role: ROLES.ADMIN });

  const totalPapers = await Paper.countDocuments();
  const approvedPapers = await Paper.countDocuments({ status: PAPER_STATUS.APPROVED });
  const pendingPapers = await Paper.countDocuments({ status: PAPER_STATUS.PENDING });
  const rejectedPapers = await Paper.countDocuments({ status: PAPER_STATUS.REJECTED });

  return {
    departmentsCount,
    subjectsCount,
    facultyMappingsCount,
    users: {
      total: totalUsers,
      students: studentsCount,
      faculty: facultyCount,
      admins: adminsCount
    },
    papers: {
      total: totalPapers,
      approved: approvedPapers,
      pending: pendingPapers,
      rejected: rejectedPapers
    }
  };
};

export const getAllUsersService = async (roleFilter) => {
  const query = {};
  if (roleFilter && Object.values(ROLES).includes(roleFilter)) {
    query.role = roleFilter;
  }

  return await User.find(query)
    .select('-password')
    .populate('department', 'deptCode deptName')
    .sort({ createdAt: -1 });
};

export const updateUserRoleService = async (userId, newRole) => {
  if (!Object.values(ROLES).includes(newRole)) {
    throw new ApiError(400, 'Invalid user role designation.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User account not found.');
  }

  user.role = newRole;
  await user.save();
  return user;
};

export const deleteUserService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User account not found.');
  }

  await User.findByIdAndDelete(userId);
  return true;
};

export const deletePaperService = async (paperId) => {
  const paper = await Paper.findById(paperId);
  if (!paper) {
    throw new ApiError(404, 'Paper not found.');
  }

  await Paper.findByIdAndDelete(paperId);
  return true;
};
