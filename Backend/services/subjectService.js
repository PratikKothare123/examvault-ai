import Subject from '../models/Subject.js';
import Department from '../models/Department.js';
import ApiError from '../utils/apiError.js';
import mongoose from 'mongoose';

export const createSubjectService = async ({ subjectCode, subjectName, departmentId, semester, year, branch }) => {
  const deptExists = await Department.findById(departmentId);
  if (!deptExists) {
    throw new ApiError(404, 'Referenced department not found.');
  }

  const normalizedCode = subjectCode.toUpperCase().trim();
  const existingSubject = await Subject.findOne({ subjectCode: normalizedCode });
  if (existingSubject) {
    throw new ApiError(409, `Subject with code '${normalizedCode}' already exists.`);
  }

  const subject = new Subject({
    subjectCode: normalizedCode,
    subjectName: subjectName.trim(),
    departmentId,
    semester,
    year: year || '1st Year',
    branch: branch || 'All Branches'
  });

  await subject.save();
  return subject;
};

export const getAllSubjectsService = async (filters = {}) => {
  const query = {};
  if (filters.departmentId) {
    query.departmentId = filters.departmentId;
  }
  if (filters.semester) {
    query.semester = filters.semester;
  }

  return await Subject.find(query)
    .populate('departmentId', 'deptCode deptName')
    .populate('assignedFaculty', 'fullName email department')
    .sort({ subjectCode: 1 });
};

export const getSubjectByIdService = async (id) => {
  const subject = await Subject.findById(id)
    .populate('departmentId', 'deptCode deptName')
    .populate('assignedFaculty', 'fullName email department');
  if (!subject) {
    throw new ApiError(404, 'Subject not found.');
  }
  return subject;
};

export const updateSubjectService = async (id, { subjectCode, subjectName, departmentId, semester, year, branch }) => {
  const subject = await Subject.findById(id);
  if (!subject) {
    throw new ApiError(404, 'Subject not found.');
  }

  if (departmentId) {
    const deptExists = await Department.findById(departmentId);
    if (!deptExists) {
      throw new ApiError(404, 'Referenced department not found.');
    }
    subject.departmentId = departmentId;
  }

  if (subjectCode) {
    const normalizedCode = subjectCode.toUpperCase().trim();
    if (normalizedCode !== subject.subjectCode) {
      const existingSubject = await Subject.findOne({ subjectCode: normalizedCode });
      if (existingSubject) {
        throw new ApiError(409, `Subject with code '${normalizedCode}' already exists.`);
      }
      subject.subjectCode = normalizedCode;
    }
  }

  if (subjectName) {
    subject.subjectName = subjectName.trim();
  }

  if (semester) {
    subject.semester = semester;
  }

  if (year) {
    subject.year = year;
  }

  if (branch) {
    subject.branch = branch;
  }

  await subject.save();
  return subject;
};

export const assignFacultyToSubjectService = async (subjectId, facultyIds = []) => {
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, 'Subject not found.');
  }

  subject.assignedFaculty = facultyIds;
  await subject.save();

  return await Subject.findById(subjectId)
    .populate('departmentId', 'deptCode deptName')
    .populate('assignedFaculty', 'fullName email department');
};

export const deleteSubjectService = async (id) => {
  const subject = await Subject.findById(id);
  if (!subject) {
    throw new ApiError(404, 'Subject not found.');
  }

  await Subject.findByIdAndDelete(id);
  return true;
};
