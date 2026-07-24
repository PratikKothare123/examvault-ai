import { 
  assignFacultyToSubjectService, 
  getAllFacultyAssignmentsService, 
  getFacultySubjectsService, 
  deleteFacultyAssignmentService 
} from '../services/facultyAssignmentService.js';
import { sendResponse } from '../utils/responseFormatter.js';

export const createAssignment = async (req, res, next) => {
  try {
    const { facultyUserId, subjectId } = req.body;
    const facultyAssignment = await assignFacultyToSubjectService({ facultyUserId, subjectId });
    return sendResponse(res, 201, 'Faculty member successfully assigned to subject', { facultyAssignment });
  } catch (error) {
    next(error);
  }
};

export const getAllAssignments = async (req, res, next) => {
  try {
    const { facultyUserId, subjectId } = req.query;
    const facultyAssignments = await getAllFacultyAssignmentsService({ facultyUserId, subjectId });
    return sendResponse(res, 200, 'Faculty assignments fetched successfully', { facultyAssignments });
  } catch (error) {
    next(error);
  }
};

export const getMySubjects = async (req, res, next) => {
  try {
    // req.user is set by authentication middleware
    const subjects = await getFacultySubjectsService(req.user.userId);
    return sendResponse(res, 200, 'Assigned subjects fetched successfully', { subjects });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteFacultyAssignmentService(id);
    return sendResponse(res, 200, 'Faculty assignment deleted successfully');
  } catch (error) {
    next(error);
  }
};
