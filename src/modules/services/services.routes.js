const express = require('express');
const router = express.Router();
const serviceController = require('./services.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Public Guest Routes
router.get('/guest', serviceController.getAllServices);
router.post('/guest/bookings', serviceController.createGuestBooking);

router.use(authenticate);

// Service Routes
router.get('/', serviceController.getAllServices);
router.post('/', serviceController.createService);

// Booking Routes (Compatibility with existing frontend calls)
router.get('/bookings', serviceController.getAllBookings);
router.post('/bookings', serviceController.createBooking);
router.patch('/bookings/:id/status', serviceController.updateBookingStatus);

module.exports = router;
