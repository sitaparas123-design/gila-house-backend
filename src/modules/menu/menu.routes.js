const express = require('express');
const router = express.Router();
const menuController = require('./menu.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.get('/items', menuController.getAllItems);
router.get('/categories', menuController.getCategories);

// Roles that can manage menu items
const authorizedMenuRoles = ['admin', 'manager', 'superadmin', 'master_admin', 'waiter', 'chef', 'cashier'];

router.post('/items', authenticate, authorize(authorizedMenuRoles), menuController.createItem);
router.patch('/items/:id', authenticate, authorize(authorizedMenuRoles), menuController.updateItem);
router.delete('/items/:id', authenticate, authorize(authorizedMenuRoles), menuController.deleteItem);

module.exports = router;
