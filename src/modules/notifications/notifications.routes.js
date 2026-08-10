const express = require('express');
const router = express.Router();
const notificationController = require('./notifications.controller');

router.get('/', notificationController.getAllNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.post('/', notificationController.createNotification);
router.patch('/:id/read', notificationController.markAsRead);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
