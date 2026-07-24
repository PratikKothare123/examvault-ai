import Department from '../models/Department.js';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import mongoose from 'mongoose';

export const createDeptService = async ({ deptCode, deptName }) => {
  const normalizedCode = deptCode.toUpperCase().trim();
  const existingDept = await Department.findOne({ deptCode: normalizedCode });
  if (existingDept) {
    throw new ApiError(409, `Department with code '${normalizedCode}' already exists.`);
  }

  const department = new Department({
    deptCode: normalizedCode,
    deptName: deptName.trim()
  });

  await department.save();
  return department;
};

export const getAllDeptsService = async () => {
  return await Department.find({}).sort({ deptCode: 1 });
};

export const getDeptByIdService = async (id) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }
  return department;
};

export const updateDeptService = async (id, { deptCode, deptName }) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }

  if (deptCode) {
    const normalizedCode = deptCode.toUpperCase().trim();
    if (normalizedCode !== department.deptCode) {
      const existingDept = await Department.findOne({ deptCode: normalizedCode });
      if (existingDept) {
        throw new ApiError(409, `Department with code '${normalizedCode}' already exists.`);
      }
      department.deptCode = normalizedCode;
    }
  }

  if (deptName) {
    department.deptName = deptName.trim();
  }

  await department.save();
  return department;
};

export const deleteDeptService = async (id) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new ApiError(404, 'Department not found.');
  }

  // Cascade check: Are there users registered under this department?
  const userCount = await User.countDocuments({ department: id });
  if (userCount > 0) {
    throw new ApiError(400, 'Cannot delete department. There are active student or faculty accounts linked to it.');
  }

  // Cascade check: Are there papers registered under this department?
  if (mongoose.models.Paper) {
    const paperCount = await mongoose.models.Paper.countDocuments({ department: id });
    if (paperCount > 0) {
      throw new ApiError(400, 'Cannot delete department. There are active question papers associated with it.');
    }
  }

  await Department.findByIdAndDelete(id);
  return true;
};
