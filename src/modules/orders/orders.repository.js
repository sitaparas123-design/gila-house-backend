const BaseModel = require('../../database/BaseModel');
const pool = require('../../database/connection');
const queries = require('./orders.sql');

class OrdersRepository extends BaseModel {
  constructor() {
    super('orders');
  }

  async findWithItems(filters = {}) {
    let sql = queries.findWithItems;
    const params = [];

    if (filters.status) {
      sql += ` AND o.order_status = ?`;
      params.push(filters.status);
    }

    if (filters.customerId) {
      sql += ` AND o.customer_id = ?`;
      params.push(filters.customerId);
    }

    if (filters.userId) {
      sql += ` AND o.user_id = ?`;
      params.push(filters.userId);
    }

    sql += ` ORDER BY o.createdAt DESC`;

    const [rows] = await pool.execute(sql, params);
    
    if (rows.length === 0) return [];

    const orderIds = rows.map(r => r.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const [itemsRows] = await pool.execute(`
      SELECT oi.order_id, oi.id, oi.menu_item_id, mi.item_name, mi.image, c.category_name, oi.quantity, oi.unit_price, oi.total_price, oi.kitchen_status
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      LEFT JOIN menu_categories c ON mi.category_id = c.id
      WHERE oi.order_id IN (${placeholders}) AND oi.deletedAt IS NULL
    `, orderIds);

    const itemsByOrder = itemsRows.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push(item);
      return acc;
    }, {});

    return rows.map(row => ({
      ...row,
      items: itemsByOrder[row.id] || []
    }));
  }

  async getOrderWithItems(id) {
    const [order] = await pool.execute(queries.getOrderById, [id]);

    if (order.length === 0) return null;

    const [items] = await pool.execute(queries.getOrderItems, [id]);

    return { ...order[0], items };
  }
}

module.exports = new OrdersRepository();
