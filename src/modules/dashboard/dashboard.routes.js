const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.get('/stats', authenticate, dashboardController.getStats);
router.get('/reports', authenticate, authorize('admin', 'manager'), dashboardController.getReports);
router.get('/heatmap', authenticate, authorize('admin', 'manager'), dashboardController.getHeatmap);
router.get('/activity-logs', authenticate, authorize('admin', 'manager'), dashboardController.getActivityLogs);

module.exports = router;
