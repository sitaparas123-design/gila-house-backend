const express = require('express');
const router = express.Router();
const couponsController = require('./coupons.controller');

// Since this is just for admins and frontend validation, we can omit auth middleware for validate, but ideally protect the rest
// Assuming standard structure, but keeping it open or using your existing auth middleware if needed

router.get('/', couponsController.getAllCoupons);
router.post('/', couponsController.createCoupon);
router.put('/:id', couponsController.updateCoupon);
router.delete('/:id', couponsController.deleteCoupon);
router.post('/validate', couponsController.validateCoupon);

module.exports = router;
