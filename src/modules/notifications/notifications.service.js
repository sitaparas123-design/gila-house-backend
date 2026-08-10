const notificationRepository = require('./notifications.repository');
const { getIO } = require('../../sockets/socket.manager');

class NotificationService {
  async createNotification(data) {
    const { user_id, notification_type, message, targetRole } = data;
    
    // 1. Save to database
    const notificationId = await notificationRepository.createNotification({
      user_id,
      notification_type,
      message,
      targetRole: targetRole || 'ALL'
    });

    // 2. Broadcast via Socket.io
    const io = getIO();
    if (targetRole && targetRole !== 'ALL' && targetRole !== 'STAFF') {
      io.to(targetRole.toLowerCase()).emit('notification', {
        id: notificationId,
        notification_type,
        message,
        targetRole,
        createdAt: new Date()
      });
    } else {
      io.emit('notification', {
        id: notificationId,
        notification_type,
        message,
        targetRole: 'ALL',
        createdAt: new Date()
      });
    }

    return notificationId;
  }

  async getAllNotifications(filters) {
    return await notificationRepository.getAllNotifications(filters);
  }

  async getUnreadCount(filters) {
    return await notificationRepository.getUnreadCount(filters);
  }

  async markAsRead(id) {
    return await notificationRepository.markAsRead(id);
  }

  async markAllAsRead(filters) {
    return await notificationRepository.markAllAsRead(filters);
  }

  async deleteNotification(id) {
    return await notificationRepository.deleteNotification(id);
  }
}

module.exports = new NotificationService();
