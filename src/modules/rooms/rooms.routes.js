const express = require('express');
const router = express.Router();
const roomsController = require('./rooms.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.get('/available', roomsController.getAvailableRooms);

router.use(authenticate);

router.get('/', roomsController.getAllRooms);
router.post('/', authorize('admin', 'manager'), roomsController.createRoom);
router.patch('/:id', authorize('admin', 'manager'), roomsController.updateRoom);
router.patch('/:id/status', authorize('admin', 'manager'), roomsController.updateStatus);
router.delete('/:id', authorize('admin', 'manager'), roomsController.deleteRoom);

module.exports = router;
