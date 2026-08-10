const BaseModel = require('../../database/BaseModel');
const pool = require('../../database/connection');

class InventoryModel extends BaseModel {
  constructor() {
    super('inventory');
  }

  async findLowStock() {
    const sql = `SELECT * FROM inventory WHERE current_stock <= threshold AND deletedAt IS NULL`;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  async logAction(inventoryId, data) {
    const { action_type, quantity, previous_stock, updated_stock, performed_by } = data;
    const sql = `
      INSERT INTO inventory_logs (inventory_id, action_type, quantity, previous_stock, updated_stock, performed_by) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [inventoryId, action_type, quantity, previous_stock, updated_stock, performed_by]);
    return result.insertId;
  }
}

module.exports = new InventoryModel();
