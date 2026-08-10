const queries = {
  findWithItems: `
    SELECT o.*, COALESCE(g.full_name, u.full_name) as guest_name, t.table_code
    FROM orders o 
    LEFT JOIN guests g ON o.customer_id = g.id 
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN restaurant_tables t ON o.table_id = t.id 
    WHERE o.deletedAt IS NULL
  `,
  getOrderById: `
    SELECT o.*, COALESCE(g.full_name, u.full_name) as guest_name, t.table_code 
    FROM orders o 
    LEFT JOIN guests g ON o.customer_id = g.id 
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN restaurant_tables t ON o.table_id = t.id 
    WHERE o.id = ? AND o.deletedAt IS NULL
  `,
  getOrderItems: `
    SELECT oi.*, mi.item_name, mi.image 
    FROM order_items oi 
    JOIN menu_items mi ON oi.menu_item_id = mi.id 
    WHERE oi.order_id = ? AND oi.deletedAt IS NULL
  `
};

module.exports = queries;
