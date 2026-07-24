import express from 'express';
import { 
  createSubject, 
  getAllSubjects, 
  getSubjectById, 
  updateSubject, 
  deleteSubject,
  assignFacultyToSubject
} from '../controllers/subjectController.js';
import { 
  validateCreateSubject, 
  validateUpdateSubject, 
  validateSubjectId 
} from '../validators/subjectValidator.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { ROLES } from '../constants/paper.constants.js';

const router = express.Router();

// Access for authenticated student/faculty members to search papers or upload
router.get('/', requireAuth, getAllSubjects);
router.get('/:id', requireAuth, validateSubjectId, getSubjectById);

// Admin management operations
router.post('/', requireAuth, requireRole(ROLES.ADMIN), validateCreateSubject, createSubject);
router.put('/:id/assign-faculty', requireAuth, requireRole(ROLES.ADMIN), validateSubjectId, assignFacultyToSubject);
router.put('/:id', requireAuth, requireRole(ROLES.ADMIN), validateSubjectId, validateUpdateSubject, updateSubject);
router.delete('/:id', requireAuth, requireRole(ROLES.ADMIN), validateSubjectId, deleteSubject);

export default router;
