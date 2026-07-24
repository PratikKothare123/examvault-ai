import express from 'express';
import { 
  getAdminStats, 
  getAllUsers, 
  updateUserRole, 
  deleteUser,
  deletePaper
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { ROLES } from '../constants/paper.constants.js';

const router = express.Router();

// Enforce Auth and Admin role on all admin routes
router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.delete('/papers/:id', deletePaper);

export default router;
