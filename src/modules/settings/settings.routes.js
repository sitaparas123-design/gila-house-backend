const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Global settings are public (needed for UI defaults before login)
router.get('/', settingsController.getSettings);
router.patch('/', authenticate, authorize('admin'), settingsController.updateSettings);

module.exports = router;
