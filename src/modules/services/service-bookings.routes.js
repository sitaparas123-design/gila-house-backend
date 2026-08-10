const express = require('express');
const router = express.Router();
const serviceController = require('./services.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

// These map directly to /api/service-bookings
router.get('/', serviceController.getAllBookings);
router.post('/', serviceController.createBooking);
router.patch('/:id/status', serviceController.updateBookingStatus);

module.exports = router;
