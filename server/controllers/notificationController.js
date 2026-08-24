import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Reusable helper to dispatch an in-app notification to any user
 */
export const createNotificationHelper = async (userId, { title, message, type = 'system', link = '' }) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      link,
      isRead: false,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error(`[Notification Error] Failed to create notification for user ${userId}:`, err.message);
    return null;
  }
};

/**
 * @desc    Get current user's notifications and unread count
 * @route   GET /api/notifications/me
 * @access  Private
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    return successResponse(res, 'Notifications retrieved successfully', {
      unreadCount,
      total: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found or access denied', 404);
    }

    notification.isRead = true;
    await notification.save();

    return successResponse(res, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read for current user
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return successResponse(res, 'All notifications marked as read', { success: true });
  } catch (error) {
    next(error);
  }
};
