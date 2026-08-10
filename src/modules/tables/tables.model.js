const BaseModel = require('../../database/BaseModel');
const pool = require('../../database/connection');

class TablesModel extends BaseModel {
  constructor() {
    super('restaurant_tables');
  }

  async findAllWithZones() {
    const sql = `
      SELECT t.*, z.zone_name, 
             o.id as active_order_id, o.grand_total as total, o.createdAt as session_start,
             r.booking_time as reservation_time,
             COALESCE(g_res.full_name, g_ord.full_name) as reserved_by,
             g_ord.full_name as customer_name
      FROM restaurant_tables t 
      JOIN table_zones z ON t.zone_id = z.id 
      LEFT JOIN orders o ON t.id = o.table_id AND o.payment_status = 'pending' AND o.deletedAt IS NULL
      LEFT JOIN guests g_ord ON o.customer_id = g_ord.id
      LEFT JOIN (
        SELECT r1.* FROM reservations r1
        WHERE r1.id = (
          SELECT id FROM reservations r2 
          WHERE r2.table_id = r1.table_id 
          AND r2.reservation_status IN ('pending', 'confirmed') 
          AND r2.deletedAt IS NULL
          ORDER BY r2.booking_date ASC, r2.booking_time ASC
          LIMIT 1
        )
      ) r ON t.id = r.table_id AND t.status = 'reserved'
      LEFT JOIN guests g_res ON r.guest_id = g_res.id
      WHERE t.deletedAt IS NULL
    `;
    const [rows] = await pool.execute(sql);
    
    // For each table with an active order, fetch items
    for (let table of rows) {
      if (table.active_order_id) {
        const [items] = await pool.execute(`
          SELECT oi.quantity, oi.unit_price as price, mi.item_name as name, oi.kitchen_status as status
          FROM order_items oi
          JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE oi.order_id = ? AND oi.deletedAt IS NULL
        `, [table.active_order_id]);
        table.orders = items;
      } else {
        table.orders = [];
      }
    }
    
    return rows;
  }

  async getZones() {
    const [rows] = await pool.execute('SELECT * FROM table_zones WHERE deletedAt IS NULL');
    return rows;
  }
}

module.exports = new TablesModel();
