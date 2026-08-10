const ordersService = require('./orders.service');
const { sendSuccess, sendError } = require('../../utils/response.formatter');

class OrdersController {
  async getAllOrders(req, res) {
    try {
      let { status, customerId, userId } = req.query;
      
      // Enforce data privacy: Customers can ONLY see their own orders
      const userRole = (req.user?.role_name || '').toLowerCase().trim();
      if (userRole === 'customer') {
        userId = req.user.id;
        // Optionally clear customerId to prevent them from querying by guest profile
        customerId = undefined; 
      }

      const orders = await ordersService.getAllOrders({ status, customerId, userId });
      const mappedOrders = orders.map(order => ({
        ...order,
        serviceChargePercent: order.service_charge_percent,
        serviceChargeAmount: order.service_charge_amount,
        updatedGrandTotal: order.grand_total
      }));
      return sendSuccess(res, 'Orders fetched successfully', mappedOrders);
    } catch (err) {
      return sendError(res, err.message);
    }
  }
  async getOrderById(req, res) {
    try {
      const order = await ordersService.getOrderById(req.params.id);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }
      order.serviceChargePercent = order.service_charge_percent;
      order.serviceChargeAmount = order.service_charge_amount;
      order.updatedGrandTotal = order.grand_total;
      return sendSuccess(res, 'Order fetched successfully', order);
    } catch (err) {
      return sendError(res, err.message);
    }
  }

  async getOrderAudit(req, res) {
    try {
      const audit = await ordersService.getAuditTrail(req.params.id);
      return sendSuccess(res, 'Audit trail fetched successfully', audit);
    } catch (err) {
      return sendError(res, err.message);
    }
  }

  async createOrder(req, res) {
    try {
      const { orderData, items } = req.body;
      const userName = req.user?.full_name || 'System';
      const { orderId, serviceChargeAmount, grandTotal } = await ordersService.createOrder(orderData, items, userName);
      return sendSuccess(res, 'Order created successfully', { 
        id: orderId,
        serviceChargeAmount,
        updatedGrandTotal: grandTotal
      }, 201);
    } catch (err) {
      return sendError(res, err.message);
    }
  }

  async createGuestOrder(req, res) {
    try {
      const { orderData, items } = req.body;
      // Force user_id to null for guest orders to prevent spoofing
      orderData.user_id = null;
      
      const { orderId, serviceChargeAmount, grandTotal } = await ordersService.createOrder(orderData, items);
      return sendSuccess(res, 'Guest order created successfully', { 
        id: orderId,
        serviceChargeAmount,
        updatedGrandTotal: grandTotal
      }, 201);
    } catch (err) {
      return sendError(res, err.message);
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const userName = req.user?.full_name || 'System';
      await ordersService.updateOrderStatus(req.params.id, status, userName);
      return sendSuccess(res, 'Order status updated successfully');
    } catch (err) {
      return sendError(res, err.message);
    }
  }

  async payOrder(req, res) {
    try {
      const { paymentMethod } = req.body;
      if (!paymentMethod) {
        return sendError(res, 'Payment method is required', 400);
      }
      await ordersService.payOrder(req.params.id, paymentMethod);
      return sendSuccess(res, 'Order payment processed successfully');
    } catch (err) {
      return sendError(res, err.message);
    }
  }
}

module.exports = new OrdersController();
