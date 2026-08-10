const notificationService = require('./notifications.service');

class NotificationController {
  async getAllNotifications(req, res) {
    try {
      const { userId, role } = req.query;
      const notifications = await notificationService.getAllNotifications({ userId, role });
      res.json({ success: true, data: notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const { userId, role } = req.query;
      const count = await notificationService.getUnreadCount({ userId, role });
      res.json({ success: true, count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async createNotification(req, res) {
    try {
      const id = await notificationService.createNotification(req.body);
      res.status(201).json({ success: true, id });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const { userId, role } = req.body;
      await notificationService.markAllAsRead({ userId, role });
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      await notificationService.deleteNotification(id);
      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

module.exports = new NotificationController();
