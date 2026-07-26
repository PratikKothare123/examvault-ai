import express from 'express';
import { 
  getUserNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  deleteNotification
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, getUserNotifications);
router.patch('/read-all', requireAuth, markAllNotificationsRead);
router.patch('/:id/read', requireAuth, markNotificationRead);
router.delete('/:id', requireAuth, deleteNotification);

export default router;
