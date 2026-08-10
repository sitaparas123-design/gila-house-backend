const express = require('express');
const router = express.Router();
const staffController = require('./staff.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// Allow all staff to view the directory
router.get('/', staffController.getAllStaff);

// Restrict modifications to admin and manager only
router.post('/', authorize('admin', 'manager'), staffController.createStaff);
router.put('/:id', authorize('admin', 'manager'), staffController.updateStaff);
router.delete('/:id', authorize('admin', 'manager'), staffController.deleteStaff);

module.exports = router;
