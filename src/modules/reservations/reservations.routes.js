const express = require('express');
const router = express.Router();
const reservationsController = require('./reservations.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.get('/', authenticate, reservationsController.getAllReservations);
router.post('/', reservationsController.createReservation);
router.patch('/:id/status', authenticate, authorize('admin', 'manager', 'waiter'), reservationsController.updateStatus);
router.delete('/:id', authenticate, authorize('admin', 'manager'), reservationsController.deleteReservation);

module.exports = router;
