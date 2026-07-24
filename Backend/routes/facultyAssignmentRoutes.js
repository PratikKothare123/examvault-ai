import express from 'express';
import { 
  createAssignment, 
  getAllAssignments, 
  getMySubjects, 
  deleteAssignment 
} from '../controllers/facultyAssignmentController.js';
import { 
  validateCreateAssignment, 
  validateAssignmentId 
} from '../validators/facultyAssignmentValidator.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { ROLES } from '../constants/paper.constants.js';

const router = express.Router();

// Faculty view endpoint
router.get('/my-subjects', requireAuth, requireRole(ROLES.FACULTY), getMySubjects);

// Admin management endpoints
router.post('/', requireAuth, requireRole(ROLES.ADMIN), validateCreateAssignment, createAssignment);
router.get('/', requireAuth, requireRole(ROLES.ADMIN), getAllAssignments);
router.delete('/:id', requireAuth, requireRole(ROLES.ADMIN), validateAssignmentId, deleteAssignment);

export default router;
