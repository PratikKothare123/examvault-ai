import express from 'express';
import { 
  createDept, 
  getAllDepts, 
  getDeptById, 
  updateDept, 
  deleteDept 
} from '../controllers/deptController.js';
import { 
  validateCreateDept, 
  validateUpdateDept, 
  validateDeptId 
} from '../validators/deptValidator.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { ROLES } from '../constants/paper.constants.js';

const router = express.Router();

// Public route to populate dropdowns for registration
router.get('/', getAllDepts);

// Protected routes
router.get('/:id', requireAuth, validateDeptId, getDeptById);

// Admin operations
router.post('/', requireAuth, requireRole(ROLES.ADMIN), validateCreateDept, createDept);
router.put('/:id', requireAuth, requireRole(ROLES.ADMIN), validateDeptId, validateUpdateDept, updateDept);
router.delete('/:id', requireAuth, requireRole(ROLES.ADMIN), validateDeptId, deleteDept);

export default router;
