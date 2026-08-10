const tablesModel = require('./tables.model');
const pool = require('../../database/connection');
const { getIO } = require('../../sockets/socket.manager');
const customerService = require('../customer/customer.service');

class TablesService {
  async getAllTables() {
    return await tablesModel.findAllWithZones();
  }

  async getZones() {
    return await tablesModel.getZones();
  }

  async updateTableStatus(id, status, extraData = null) {
    const result = await tablesModel.update(id, { status });
    
    // If status is occupied and extraData is provided, handle order creation/update
    if (status === 'occupied' && extraData) {
      const orders = extraData.orders || [];
      const total = parseFloat(extraData.total || 0) || 0;
      
      // Check if there's already an active order for this table
      const [existingOrders] = await pool.execute(
        'SELECT id FROM orders WHERE table_id = ? AND payment_status = "pending" AND deletedAt IS NULL',
        [id]
      );

      if (existingOrders.length > 0) {
        const orderId = existingOrders[0].id;
        // Update existing order
        await pool.execute(
          'UPDATE orders SET subtotal = ?, grand_total = ? WHERE id = ?',
          [total, total, orderId]
        );

        // Add new items (this is a simplified logic for "Quick Add")
        // We'll just add the last item if orders length increased
        if (orders && orders.length > 0) {
          const lastItem = orders[orders.length - 1];
          
          // Get menu_item_id from name
          const [menuItems] = await pool.execute(
            'SELECT id FROM menu_items WHERE item_name = ?',
            [lastItem.name]
          );

          if (menuItems.length > 0) {
            await pool.execute(
              'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
              [orderId, menuItems[0].id, 1, lastItem.price, lastItem.price]
            );
          }
        }
      } else {
        // Create new order
        const order_number = `ORD-TBL-${id}-${Date.now()}`;
        const [orderResult] = await pool.execute(
          'INSERT INTO orders (order_number, table_id, subtotal, grand_total, payment_status, order_status) VALUES (?, ?, ?, ?, "pending", "new")',
          [order_number, id, total || 0, total || 0]
        );
        
        const orderId = orderResult.insertId;

        // Add initial items if any
        if (orders && orders.length > 0) {
          for (let item of orders) {
             const [menuItems] = await pool.execute(
               'SELECT id FROM menu_items WHERE item_name = ?',
               [item.name]
             );
             if (menuItems.length > 0) {
               await pool.execute(
                 'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
                 [orderId, menuItems[0].id, 1, item.price, item.price]
               );
             }
          }
        }
      }
    } else if (status === 'available') {
      // If table becomes available, we mark the pending order as paid
      if (extraData && extraData.paymentMethod) {
        const [existingOrders] = await pool.execute(
          'SELECT id, grand_total, customer_id FROM orders WHERE table_id = ? AND payment_status = "pending" AND deletedAt IS NULL',
          [id]
        );

        if (existingOrders.length > 0) {
          const orderId = existingOrders[0].id;
          const amount = existingOrders[0].grand_total;
          const customerId = existingOrders[0].customer_id;
          
          // Map frontend payment method names to DB-friendly values
          const methodMap = {
            'cash': 'cash', 'Cash': 'cash',
            'card': 'card', 'Card': 'card',
            'QR Code': 'qr_code', 'qr_code': 'qr_code', 'qr code': 'qr_code',
            'Bank': 'bank_transfer', 'bank': 'bank_transfer', 'bank_transfer': 'bank_transfer'
          };
          const dbMethod = methodMap[extraData.paymentMethod] || 'cash';

          // Update order to paid
          await pool.execute(
            'UPDATE orders SET payment_status = "paid", order_status = "delivered" WHERE id = ?',
            [orderId]
          );

          // Record the transaction
          try {
             await pool.execute(
               'INSERT INTO transactions (transaction_code, total_amount, transaction_status, payment_gateway) VALUES (?, ?, ?, ?)',
               [`TXN-TBL-${id}-${Date.now()}`, amount, 'completed', dbMethod]
             );
          } catch(e) {
             console.error("Error inserting transaction", e);
          }

          // Recalculate customer analytics
          if (customerId) {
            await customerService.recalculateCustomerAnalytics(customerId);
          }
        }
      }
    }

    // Notify all clients about table status change
    const io = getIO();
    io.emit('table_status_update', { id, status });
    
    return result;
  }

  async createTable(data) {
    let zone_id = data.zone_id || null;

    if (data.floor && !zone_id) {
      const zones = await tablesModel.getZones();
      let zone = zones.find(z => z.zone_name.toLowerCase() === data.floor.toLowerCase());
      
      if (zone) {
        zone_id = zone.id;
      } else {
        // Create the zone if it doesn't exist
        const [result] = await pool.execute(
          'INSERT INTO table_zones (zone_name) VALUES (?)',
          [data.floor]
        );
        zone_id = result.insertId;
      }
    }

    const payload = {
      table_code: data.name || `T-${Date.now()}`,
      capacity: data.capacity || 2,
      status: 'available',
      zone_id: zone_id || 1 // Fallback to first zone or null if needed
    };

    return await tablesModel.create(payload);
  }

  async deleteTable(id) {
    return await tablesModel.softDelete(id);
  }
}

module.exports = new TablesService();
