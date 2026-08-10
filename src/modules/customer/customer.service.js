const pool = require('../../database/connection');

class CustomerService {
  async recalculateCustomerAnalytics(customerId) {
    if (!customerId) return;
    try {
      // Find all completed/paid orders for this customer (excluding cancelled orders)
      const [orders] = await pool.execute(
        `SELECT grand_total, payment_method 
         FROM orders 
         WHERE customer_id = ? AND payment_status = 'paid' AND order_status != 'cancelled' AND deletedAt IS NULL`,
        [customerId]
      );
      
      const visitCount = orders.length;
      let totalSpending = 0;
      const paymentCounts = {};
      
      for (const order of orders) {
        totalSpending += parseFloat(order.grand_total || 0);
        if (order.payment_method) {
          const method = order.payment_method.toLowerCase();
          paymentCounts[method] = (paymentCounts[method] || 0) + 1;
        }
      }
      
      const averageSpending = visitCount > 0 ? (totalSpending / visitCount) : 0;
      
      // Determine the most frequent payment method
      let preferredPayment = null;
      let maxCount = 0;
      for (const method in paymentCounts) {
        if (paymentCounts[method] > maxCount) {
          maxCount = paymentCounts[method];
          preferredPayment = method;
        }
      }
      
      // Update guests table with computed read-only metrics
      await pool.execute(
        `UPDATE guests 
         SET visit_count = ?, total_spending = ?, average_spending = ?, preferred_payment = ? 
         WHERE id = ?`,
        [visitCount, totalSpending, averageSpending, preferredPayment, customerId]
      );
      
      console.log(`[Analytics] Recalculated for customer ${customerId}: visits=${visitCount}, total=${totalSpending}, preferred=${preferredPayment}`);
    } catch (err) {
      console.error(`[Analytics Error] Failed for customer ${customerId}:`, err);
    }
  }
}

module.exports = new CustomerService();
