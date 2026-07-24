import { 
  createDeptService, 
  getAllDeptsService, 
  getDeptByIdService, 
  updateDeptService, 
  deleteDeptService 
} from '../services/deptService.js';
import { sendResponse } from '../utils/responseFormatter.js';

export const createDept = async (req, res, next) => {
  try {
    const { deptCode, deptName } = req.body;
    const department = await createDeptService({ deptCode, deptName });
    return sendResponse(res, 201, 'Department created successfully', { department });
  } catch (error) {
    next(error);
  }
};

export const getAllDepts = async (req, res, next) => {
  try {
    const departments = await getAllDeptsService();
    return sendResponse(res, 200, 'Departments fetched successfully', { departments });
  } catch (error) {
    next(error);
  }
};

export const getDeptById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await getDeptByIdService(id);
    return sendResponse(res, 200, 'Department details fetched successfully', { department });
  } catch (error) {
    next(error);
  }
};

export const updateDept = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deptCode, deptName } = req.body;
    const department = await updateDeptService(id, { deptCode, deptName });
    return sendResponse(res, 200, 'Department updated successfully', { department });
  } catch (error) {
    next(error);
  }
};

export const deleteDept = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteDeptService(id);
    return sendResponse(res, 200, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
};
