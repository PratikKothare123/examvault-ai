import Notification from '../models/Notification.js';
import ApiError from '../utils/apiError.js';

export const getUserNotificationsService = async (recipientId) => {
  const notifications = await Notification.find({ recipientId }).sort({ createdAt: -1 });
  const unreadCount = await Notification.countDocuments({ recipientId, isRead: false });

  return {
    notifications,
    unreadCount
  };
};

export const markNotificationReadService = async (notificationId, recipientId) => {
  const notification = await Notification.findOne({ _id: notificationId, recipientId });
  if (!notification) {
    throw new ApiError(404, 'Notification record not found.');
  }

  notification.isRead = true;
  await notification.save();
  return notification;
};

export const markAllNotificationsReadService = async (recipientId) => {
  await Notification.updateMany(
    { recipientId, isRead: false },
    { isRead: true }
  );
  return true;
};

export const deleteNotificationService = async (notificationId, recipientId) => {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, recipientId });
  if (!notification) {
    throw new ApiError(404, 'Notification not found or access denied.');
  }
  return notification;
};
