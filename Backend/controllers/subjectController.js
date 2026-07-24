import { 
  createSubjectService, 
  getAllSubjectsService, 
  getSubjectByIdService, 
  updateSubjectService, 
  deleteSubjectService,
  assignFacultyToSubjectService
} from '../services/subjectService.js';
import { sendResponse } from '../utils/responseFormatter.js';

export const createSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, departmentId, semester, year, branch } = req.body;
    const subject = await createSubjectService({ subjectCode, subjectName, departmentId, semester, year, branch });
    return sendResponse(res, 201, 'Subject created successfully', { subject });
  } catch (error) {
    next(error);
  }
};

export const getAllSubjects = async (req, res, next) => {
  try {
    const { departmentId, semester } = req.query;
    const subjects = await getAllSubjectsService({ departmentId, semester });
    return sendResponse(res, 200, 'Subjects fetched successfully', { subjects });
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await getSubjectByIdService(id);
    return sendResponse(res, 200, 'Subject details fetched successfully', { subject });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjectCode, subjectName, departmentId, semester, year, branch } = req.body;
    const subject = await updateSubjectService(id, { subjectCode, subjectName, departmentId, semester, year, branch });
    return sendResponse(res, 200, 'Subject updated successfully', { subject });
  } catch (error) {
    next(error);
  }
};

export const assignFacultyToSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { facultyIds } = req.body;
    const subject = await assignFacultyToSubjectService(id, facultyIds || []);
    return sendResponse(res, 200, 'Faculty members assigned to subject successfully', { subject });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteSubjectService(id);
    return sendResponse(res, 200, 'Subject deleted successfully');
  } catch (error) {
    next(error);
  }
};
