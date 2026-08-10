const ordersRepository = require('./orders.repository');
const { getIO } = require('../../sockets/socket.manager');
const notificationService = require('../notifications/notifications.service');
const pool = require('../../database/connection');
const dashboardService = require('../dashboard/dashboard.service');
const customerService = require('../customer/customer.service');

class OrdersService {
  async getAllOrders(filters) {
    return await ordersRepository.findWithItems(filters);
  }

  async getOrderById(id) {
    return await ordersRepository.getOrderWithItems(id);
  }

  async getAuditTrail(id) {
    const pool = require('../../database/connection');
    const [logs] = await pool.execute(
      'SELECT status, action, user_name, created_at FROM order_status_logs WHERE order_id = ? ORDER BY created_at DESC',
      [id]
    );
    return logs;
  }

  async createOrder(orderData, items, userName = 'System') {
    // 1. Recalculate subtotal securely from items to avoid trusting frontend values
    const calculatedSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * parseInt(item.quantity)), 0);
    
    const discount = parseFloat(orderData.discount) || 0;
    const tax = parseFloat(orderData.tax) || 0;
    
    // Support both camelCase and snake_case for service charge percent
    let serviceChargePercent = 0;
    if (orderData.serviceChargePercent !== undefined) {
      serviceChargePercent = parseFloat(orderData.serviceChargePercent);
    } else if (orderData.service_charge_percent !== undefined) {
      serviceChargePercent = parseFloat(orderData.service_charge_percent);
    }
    
    // Validate percent is only allowed values [0, 5, 10, 30]
    if (![0, 5, 10, 30].includes(serviceChargePercent)) {
      throw new Error('Invalid service charge percentage. Allowed values are 0, 5, 10, 30.');
    }
    
    const serviceChargeAmount = parseFloat((calculatedSubtotal * (serviceChargePercent / 100)).toFixed(2));
    const grandTotal = parseFloat((calculatedSubtotal + tax - discount + serviceChargeAmount).toFixed(2));
    
    // Prepare data for database insertion (matching DB column names)
    const dbOrderData = {
      order_number: orderData.order_number,
      customer_id: orderData.customer_id,
      user_id: orderData.user_id,
      table_id: orderData.table_id,
      order_type: orderData.order_type,
      subtotal: calculatedSubtotal,
      tax: tax,
      discount: discount,
      service_charge_percent: serviceChargePercent,
      service_charge_amount: serviceChargeAmount,
      grand_total: grandTotal,
      payment_status: orderData.payment_status || 'pending',
      payment_method: orderData.payment_method || null,
      order_status: orderData.order_status || (orderData.payment_status === 'paid' ? 'Confirmed' : 'Waiting Payment'),
      assigned_waiter: orderData.assigned_waiter,
      assigned_chef: orderData.assigned_chef
    };

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    console.log('[OrdersService] Creating order with DB payload:', {
      order_number: dbOrderData.order_number,
      order_type: dbOrderData.order_type,
      payment_status: dbOrderData.payment_status,
      order_status: dbOrderData.order_status
    });
    console.log('[OrdersService] Allowed order_status values: Draft, Waiting Payment, Paid, Confirmed, Preparing, Ready, Served, Completed, Cancelled, Refunded, new, pending, cooking, delivered');

    try {
      // 1. Create Order
      const orderId = await ordersRepository.create(dbOrderData);

      // 2. Create Order Items
      for (const item of items) {
        await connection.execute(
          'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.menu_item_id, item.quantity, item.unit_price, item.total_price]
        );
      }
      
      // 5. Audit Log
      await connection.execute(
        'INSERT INTO order_status_logs (order_id, status, action, user_name) VALUES (?, ?, ?, ?)',
        [orderId, dbOrderData.order_status, 'Ticket Generated', userName]
      );

      await connection.commit();

      // Recalculate customer analytics if immediately paid
      if (orderData.payment_status === 'paid' && dbOrderData.customer_id) {
        await customerService.recalculateCustomerAnalytics(dbOrderData.customer_id);
      }

      // 3. Record Transaction if paid
      if (orderData.payment_status === 'paid' && orderData.payment_method) {
        const methodMap = {
          'cash': 'cash', 'Cash': 'cash',
          'card': 'card', 'Card': 'card',
          'qr_code': 'qr_code', 'QR Code': 'qr_code', 'qr code': 'qr_code',
          'bank': 'bank_transfer', 'Bank': 'bank_transfer', 'bank_transfer': 'bank_transfer',
          'upi': 'upi', 'UPI': 'upi',
          'google pay': 'google_pay', 'Google Pay': 'google_pay',
          'apple pay': 'apple_pay', 'Apple Pay': 'apple_pay',
          'online': 'online', 'Online': 'online',
          'cashier': 'cashier', 'Cashier': 'cashier', 'Card at Cashier': 'cashier'
        };
        const dbMethod = methodMap[orderData.payment_method] || 'cash';
        try {
          await pool.execute(
            'INSERT INTO transactions (transaction_code, total_amount, transaction_status, payment_gateway) VALUES (?, ?, ?, ?)',
            [`TXN-ORD-${orderId}-${Date.now()}`, grandTotal, 'completed', dbMethod]
          );
        } catch (txnErr) {
          console.error('Failed to record transaction:', txnErr);
        }
      }

      // 4. Socket Notification
      const io = getIO();
      io.emit('new_order', { ...dbOrderData, id: orderId });
      
      if (dbOrderData.payment_status === 'paid') {
        io.to('chef').emit('new_kitchen_ticket', { orderId });
        await notificationService.createNotification({
          notification_type: 'ORDER',
          message: `New Order Received: #${dbOrderData.order_number}`,
          targetRole: 'CHEF'
        });
      }
      
      await notificationService.createNotification({
        notification_type: 'ORDER',
        message: `New Order Placed: #${dbOrderData.order_number}`,
        targetRole: 'ADMIN'
      });

      // 5. Activity Log
      await dashboardService.insertActivityLog(
        `New Order Placed: #${dbOrderData.order_number} by ${userName}`,
        'order', 'orders', orderId
      );
      io.emit('activity_log_update');

      return {
        orderId,
        serviceChargeAmount,
        grandTotal
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async updateOrderStatus(id, status, userName = 'System') {
    const result = await ordersRepository.update(id, { order_status: status });
    
    // Socket Notification
    const io = getIO();
    io.emit('order_update', { id, status });

    // Save Notification
    await notificationService.createNotification({
      notification_type: 'ORDER_UPDATE',
      message: `Order #${id} is now ${status}`,
      targetRole: status === 'Ready' ? 'WAITER' : 'ADMIN'
    });

    try {
      const [orderRows] = await pool.execute('SELECT user_id, order_number FROM orders WHERE id = ?', [id]);
      if (orderRows.length > 0 && orderRows[0].user_id) {
        await notificationService.createNotification({
          user_id: orderRows[0].user_id,
          notification_type: 'ORDER_UPDATE',
          message: `Your order #${orderRows[0].order_number || id} is now ${status}!`,
          targetRole: 'CUSTOMER'
        });
      }
    } catch (err) {
      console.error('Failed to notify customer of order status update:', err);
    }
    
    let action = 'Status Updated';
    if (status === 'pending') action = 'Sent to Kitchen';
    else if (status === 'cooking') action = 'Preparation Started';
    else if (status === 'ready') action = 'Quality Checked & Ready';
    else if (status === 'delivered') action = 'Order Delivered';
    else if (status === 'cancelled') action = 'Order Voided';
    
    await pool.execute(
      'INSERT INTO order_status_logs (order_id, status, action, user_name) VALUES (?, ?, ?, ?)',
      [id, status, action, userName]
    );

    // Activity Log
    await dashboardService.insertActivityLog(
      `Order #${id} — ${action} by ${userName}`,
      'order', 'orders', id
    );
    // Recalculate customer analytics if order status changes (e.g. cancellation)
    try {
      const [orderRows] = await pool.execute('SELECT customer_id FROM orders WHERE id = ?', [id]);
      if (orderRows.length > 0 && orderRows[0].customer_id) {
        await customerService.recalculateCustomerAnalytics(orderRows[0].customer_id);
      }
    } catch (err) {
      console.error('Failed to update analytics on status update:', err);
    }

    return result;
  }

  async payOrder(id, paymentMethod) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE id = ? AND deletedAt IS NULL',
        [id]
      );
      if (orders.length === 0) throw new Error('Order not found');
      const order = orders[0];

      if (order.payment_status === 'paid') {
        throw new Error('Order is already paid');
      }

      // Update order status to Confirmed (sent to kitchen) and payment_status to paid
      await connection.execute(
        'UPDATE orders SET payment_status = "paid", order_status = "Confirmed", payment_method = ? WHERE id = ?',
        [paymentMethod, id]
      );

      // Create transaction log
      const txnCode = `TXN-ORD-${id}-${Date.now()}`;
      await connection.execute(
        'INSERT INTO transactions (transaction_code, total_amount, transaction_status, payment_gateway) VALUES (?, ?, ?, ?)',
        [txnCode, order.grand_total, 'completed', paymentMethod]
      );

      // Log status change
      await connection.execute(
        'INSERT INTO order_status_logs (order_id, status, action, user_name) VALUES (?, ?, ?, ?)',
        [id, 'Confirmed', 'Payment Confirmed - Sent to Kitchen', 'System']
      );

      await connection.commit();

      // Recalculate customer analytics after successful payment confirmation
      if (order.customer_id) {
        await customerService.recalculateCustomerAnalytics(order.customer_id);
      }

      // Emit socket notification so kitchen/waiter updates instantly
      const io = getIO();
      io.emit('order_update', { id, status: 'Confirmed', payment_status: 'paid' });
      io.to('chef').emit('new_kitchen_ticket', { orderId: id });
      
      await notificationService.createNotification({
        notification_type: 'ORDER',
        message: `Order #${id} Paid & Confirmed`,
        targetRole: 'CHEF'
      });
      
      io.emit('activity_log_update');

      return { success: true };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = new OrdersService();
