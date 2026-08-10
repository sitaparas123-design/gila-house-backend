const express = require('express');
const router = express.Router();
const ordersController = require('./orders.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../validators/common.validator');
const { createOrderSchema, updateOrderStatusSchema } = require('./orders.validation');

// Public route for guest orders (no authentication required)
router.post('/guest', validate(createOrderSchema), ordersController.createGuestOrder);

router.use(authenticate);

router.get('/', ordersController.getAllOrders);
router.get('/:id', ordersController.getOrderById);
router.get('/:id/audit', ordersController.getOrderAudit);
router.post('/', authorize('waiter', 'customer', 'manager', 'admin'), validate(createOrderSchema), ordersController.createOrder);
router.patch('/:id/status', authorize('chef', 'manager', 'admin', 'waiter', 'customer'), validate(updateOrderStatusSchema), ordersController.updateStatus);
router.post('/:id/pay', authorize('customer', 'manager', 'admin', 'cashier', 'waiter'), ordersController.payOrder);

module.exports = router;
