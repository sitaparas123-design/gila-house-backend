const express = require('express');
const router = express.Router();
const inventoryController = require('./inventory.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/', inventoryController.getAllStock);
router.post('/', authorize('admin', 'manager', 'chef'), inventoryController.addInventoryItem);
router.patch('/:id', authorize('admin', 'manager', 'chef'), inventoryController.updateStock);
router.delete('/:id', authorize('admin', 'manager', 'chef'), inventoryController.deleteInventoryItem);

module.exports = router;
