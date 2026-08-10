const couponsService = require('./coupons.service');
const { sendSuccess, sendError } = require('../../utils/response.formatter');

class CouponsController {
  async getAllCoupons(req, res) {
    try {
      const coupons = await couponsService.getAllCoupons();
      return sendSuccess(res, 'Coupons fetched successfully', coupons);
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async createCoupon(req, res) {
    try {
      const id = await couponsService.createCoupon(req.body);
      return sendSuccess(res, 'Coupon created successfully', { id }, 201);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return sendError(res, 'Coupon code already exists', 400);
      }
      return sendError(res, error.message);
    }
  }

  async updateCoupon(req, res) {
    try {
      await couponsService.updateCoupon(req.params.id, req.body);
      return sendSuccess(res, 'Coupon updated successfully');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async deleteCoupon(req, res) {
    try {
      await couponsService.deleteCoupon(req.params.id);
      return sendSuccess(res, 'Coupon deleted successfully');
    } catch (error) {
      return sendError(res, error.message);
    }
  }

  async validateCoupon(req, res) {
    try {
      const { code, cart_total } = req.body;
      if (!code) {
        return sendError(res, 'Coupon code is required', 400);
      }

      // Optional JWT authentication to identify customer/user
      let userId = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id;
        } catch (e) {
          // ignore parsing error to allow fallback
        }
      }

      const result = await couponsService.validateCoupon(code, parseFloat(cart_total) || 0, userId);
      return sendSuccess(res, result.message, result);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }
}

module.exports = new CouponsController();
