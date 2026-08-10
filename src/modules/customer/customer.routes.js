const express = require('express');
const router = express.Router();
const customerController = require('./customer.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/favorites', customerController.getFavorites);
router.post('/favorites', customerController.toggleFavorite);
router.get('/profile', customerController.getProfile);
router.put('/profile', customerController.updateProfile);
router.post('/redeem', customerController.redeemReward);

module.exports = router;
