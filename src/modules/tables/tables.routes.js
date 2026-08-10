const express = require('express');
const router = express.Router();
const tablesController = require('./tables.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.get('/public', tablesController.getAllTables);

router.use(authenticate);

router.get('/', tablesController.getAllTables);
router.get('/zones', tablesController.getZones);
router.post('/', authorize('admin', 'manager', 'waiter'), tablesController.createTable);
router.patch('/:id/status', authorize('admin', 'manager', 'waiter'), tablesController.updateStatus);
router.delete('/:id', authorize('admin', 'manager'), tablesController.deleteTable);

module.exports = router;
