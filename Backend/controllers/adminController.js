import { 
  getAdminStatsService, 
  getAllUsersService, 
  updateUserRoleService, 
  deleteUserService,
  deletePaperService
} from '../services/adminService.js';
import { sendResponse } from '../utils/responseFormatter.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await getAdminStatsService();
    return sendResponse(res, 200, 'System analytics stats retrieved successfully', { stats });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const users = await getAllUsersService(role);
    return sendResponse(res, 200, 'System users list retrieved successfully', { users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await updateUserRoleService(id, role);
    return sendResponse(res, 200, 'User role updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteUserService(id);
    return sendResponse(res, 200, 'User account deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const deletePaper = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deletePaperService(id);
    return sendResponse(res, 200, 'Paper deleted successfully');
  } catch (error) {
    next(error);
  }
};
