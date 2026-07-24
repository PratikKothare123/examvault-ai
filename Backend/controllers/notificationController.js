import { 
  getUserNotificationsService, 
  markNotificationReadService, 
  markAllNotificationsReadService 
} from '../services/notificationService.js';
import { sendResponse } from '../utils/responseFormatter.js';

export const getUserNotifications = async (req, res, next) => {
  try {
    const { notifications, unreadCount } = await getUserNotificationsService(req.user.userId);
    return sendResponse(res, 200, 'Notifications fetched successfully', { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await markNotificationReadService(id, req.user.userId);
    return sendResponse(res, 200, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await markAllNotificationsReadService(req.user.userId);
    return sendResponse(res, 200, 'All notifications marked as read', {});
  } catch (error) {
    next(error);
  }
};
