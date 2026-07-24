import Paper from '../models/Paper.js';
import { PAPER_STATUS } from '../constants/paper.constants.js';

export const searchPapersService = async (filters = {}) => {
  // Enforce retrieval of Approved papers only
  const query = { status: PAPER_STATUS.APPROVED };

  const filterFields = [
    'departmentId',
    'semester',
    'subjectId',
    'academicYear',
    'examType'
  ];

  for (const field of filterFields) {
    if (filters[field] && filters[field].trim() !== '') {
      query[field] = filters[field].trim();
    }
  }

  return await Paper.find(query)
    .populate('uploadedBy', 'fullName email')
    .populate('departmentId', 'deptCode deptName')
    .populate('subjectId', 'subjectCode subjectName semester')
    .sort({ academicYear: -1, examType: 1 });
};
