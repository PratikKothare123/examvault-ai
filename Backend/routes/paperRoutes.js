import express from 'express';
import { uploadPaper, getPaperDetails, downloadPaper } from '../controllers/paperController.js';
import { 
  getPendingQueue, 
  getApprovedHistory, 
  verifyPaper 
} from '../controllers/verificationController.js';
import { searchPapers } from '../controllers/searchController.js';
import { uploadMiddleware, validatePdfSignature } from '../middleware/fileUploadMiddleware.js';
import { validatePaperMetadata } from '../validators/paperValidator.js';
import { validateVerifyAction, validatePaperId } from '../validators/verificationValidator.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';
import { ROLES } from '../constants/paper.constants.js';

const router = express.Router();

// Allow Students, Faculty, and Admin to upload question papers
router.post(
  '/',
  requireAuth,
  requireRole(ROLES.STUDENT, ROLES.FACULTY, ROLES.ADMIN),
  uploadLimiter,
  uploadMiddleware,
  validatePdfSignature,
  validatePaperMetadata,
  uploadPaper
);

// Search endpoint (Placed before /:id to prevent routing conflicts)
router.get('/search', requireAuth, searchPapers);

// Faculty moderation queues
router.get('/faculty/pending', requireAuth, requireRole(ROLES.FACULTY), getPendingQueue);
router.get('/faculty/approved', requireAuth, requireRole(ROLES.FACULTY), getApprovedHistory);

// Verify specific paper status
router.patch('/:id/verify', requireAuth, requireRole(ROLES.FACULTY), validatePaperId, validateVerifyAction, verifyPaper);

// Secure paper download endpoint
router.get('/:id/download', requireAuth, validatePaperId, downloadPaper);

// Query detailed paper metadata status
router.get('/:id', requireAuth, getPaperDetails);

export default router;
