const pool = require('../../database/connection');

class DashboardService {
  getDateFilter(range, tableAlias = '') {
    const field = tableAlias ? `${tableAlias}.createdAt` : 'createdAt';
    let filter = '';
    switch (range?.toLowerCase()) {
      case 'today':
        filter = `AND DATE(${field}) = CURDATE()`;
        break;
      case 'this week':
        filter = `AND YEARWEEK(${field}, 1) = YEARWEEK(CURDATE(), 1)`;
        break;
      case 'this month':
        filter = `AND MONTH(${field}) = MONTH(CURDATE()) AND YEAR(${field}) = YEAR(CURDATE())`;
        break;
      case 'last month':
        filter = `AND MONTH(${field}) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(${field}) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`;
        break;
      case 'last 90 days':
        filter = `AND ${field} >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)`;
        break;
      case 'financial year':
        filter = `AND ${field} >= DATE(CONCAT(IF(MONTH(CURDATE()) < 4, YEAR(CURDATE()) - 1, YEAR(CURDATE())), "-04-01"))`;
        break;
      case 'all time':
        filter = '';
        break;
      default:
        filter = '';
    }
    return filter;
  }

  async getAdminStats(filters = {}) {
    const dateFilter = this.getDateFilter(filters.range);

    const [revenue] = await pool.execute(`SELECT SUM(grand_total) as total_revenue FROM orders WHERE payment_status = "paid" ${dateFilter}`);
    const [ordersCount] = await pool.execute(`SELECT COUNT(*) as total_orders FROM orders WHERE 1=1 ${dateFilter}`);
    const [pendingReservations] = await pool.execute(`SELECT COUNT(*) as pending_reservations FROM reservations WHERE reservation_status = "pending" ${dateFilter}`);
    const [activeStaff] = await pool.execute('SELECT COUNT(*) as active_staff FROM users WHERE role_id != 6 AND status = "active"');
    
    const [lowStock] = await pool.execute('SELECT COUNT(*) as low_stock FROM inventory WHERE current_stock <= threshold AND deletedAt IS NULL');
    const [pendingOrders] = await pool.execute('SELECT COUNT(*) as pending_orders FROM orders WHERE order_status = "pending"');
    const [cookingOrders] = await pool.execute('SELECT COUNT(*) as cooking_orders FROM orders WHERE order_status = "cooking"');
    const [readyOrders] = await pool.execute('SELECT COUNT(*) as ready_orders FROM orders WHERE order_status = "ready"');

    // Monthly revenue chart data
    const [monthlyRevenue] = await pool.execute(`
      SELECT DATE_FORMAT(createdAt, '%b %d') as month, SUM(grand_total) as revenue 
      FROM orders 
      WHERE payment_status = "paid" 
      ${dateFilter}
      GROUP BY DATE(createdAt), DATE_FORMAT(createdAt, '%b %d') 
      ORDER BY DATE(createdAt) ASC
    `);

    // Monthly orders chart data
    const [monthlyOrders] = await pool.execute(`
      SELECT DATE_FORMAT(createdAt, '%b %d') as month, COUNT(*) as count 
      FROM orders 
      WHERE 1=1 
      ${dateFilter}
      GROUP BY DATE(createdAt), DATE_FORMAT(createdAt, '%b %d') 
      ORDER BY DATE(createdAt) ASC
    `);

    // Monthly guests chart data
    const [monthlyGuests] = await pool.execute(`
      SELECT DATE_FORMAT(createdAt, '%b %d') as month, SUM(guests_count) as count 
      FROM reservations 
      WHERE 1=1 
      ${dateFilter}
      GROUP BY DATE(createdAt), DATE_FORMAT(createdAt, '%b %d') 
      ORDER BY DATE(createdAt) ASC
    `);

    return {
      stats: {
        total_revenue: revenue[0].total_revenue || 0,
        total_orders: ordersCount[0].total_orders,
        pending_reservations: pendingReservations[0].pending_reservations,
        active_staff: activeStaff[0].active_staff,
        low_stock: lowStock[0].low_stock,
        pending_orders: pendingOrders[0].pending_orders,
        cooking_orders: cookingOrders[0].cooking_orders,
        ready_orders: readyOrders[0].ready_orders
      },
      charts: {
        monthlyRevenue,
        monthlyOrders,
        monthlyGuests
      }
    };
  }

  async getManagerStats(filters = {}) {
    return await this.getAdminStats(filters);
  }

  async getReports(filters = {}) {
    const dateFilter = this.getDateFilter(filters.range, 'o');

    // Top selling items
    const [topDishes] = await pool.execute(`
      SELECT mi.item_name as name, COUNT(oi.id) as orders, SUM(oi.total_price) as revenue 
      FROM order_items oi 
      JOIN menu_items mi ON oi.menu_item_id = mi.id 
      JOIN orders o ON oi.order_id = o.id
      WHERE 1=1 ${dateFilter}
      GROUP BY mi.id 
      ORDER BY orders DESC 
      LIMIT 10
    `);

    // Staff performance
    const [staffPerformance] = await pool.execute(`
      SELECT u.full_name as name, r.role_name as role, COUNT(o.id) as orders, SUM(o.grand_total) as revenue 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      JOIN roles r ON u.role_id = r.id
      WHERE 1=1 ${dateFilter}
      GROUP BY u.id 
      ORDER BY revenue DESC
    `);

    // Category split
    const [categorySplit] = await pool.execute(`
      SELECT mc.category_name as name, SUM(oi.total_price) as revenue 
      FROM order_items oi 
      JOIN menu_items mi ON oi.menu_item_id = mi.id 
      JOIN menu_categories mc ON mi.category_id = mc.id 
      JOIN orders o ON oi.order_id = o.id
      WHERE 1=1 ${dateFilter}
      GROUP BY mc.id
    `);

    // Payment method breakdown from transactions
    const [paymentMethodBreakdown] = await pool.execute(`
      SELECT 
        COALESCE(payment_gateway, 'cash') as method,
        COUNT(*) as count,
        SUM(total_amount) as revenue
      FROM transactions
      WHERE transaction_status = 'completed'
      GROUP BY payment_gateway
    `);

    return {
      topDishes,
      staffPerformance,
      categorySplit,
      paymentMethodBreakdown
    };
  }

  async getTrafficHeatmap() {
    const [rows] = await pool.execute(`
      SELECT DAYNAME(createdAt) as day, HOUR(createdAt) as hour, COUNT(*) as orders 
      FROM orders 
      WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(createdAt), HOUR(createdAt), DAYNAME(createdAt) 
      ORDER BY MIN(createdAt) ASC, HOUR(createdAt) ASC
    `);
    return rows;
  }

  /**
   * Insert a new activity log entry into the DB
   */
  async insertActivityLog(message, type = 'system', entity_type = null, entity_id = null) {
    try {
      await pool.execute(
        'INSERT INTO activity_logs (message, type, entity_type, entity_id) VALUES (?, ?, ?, ?)',
        [message, type, entity_type, entity_id]
      );
    } catch (err) {
      // Non-fatal: log failure should not break the main operation
      console.error('Activity log insert failed:', err.message);
    }
  }

  /**
   * Get recent activity logs
   */
  async getActivityLogs(limit = 20) {
    const parsedLimit = parseInt(limit, 10) || 20;
    const [rows] = await pool.query(
      `SELECT id, message, type, entity_type, entity_id, created_at FROM activity_logs ORDER BY created_at DESC LIMIT ${parsedLimit}`
    );
    return rows;
  }
}

module.exports = new DashboardService();

