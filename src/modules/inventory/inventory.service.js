const inventoryModel = require('./inventory.model');
const { getIO } = require('../../sockets/socket.manager');

class InventoryService {
  async getAllStock() {
    return await inventoryModel.findAll();
  }

  async updateStock(id, quantity, actionType, userId) {
    const item = await inventoryModel.findOne('id = ?', [id]);
    if (!item) throw new Error('Inventory item not found');

    const previous_stock = item.current_stock;
    let updated_stock;

    if (actionType === 'add') {
      updated_stock = Number(previous_stock) + Number(quantity);
    } else {
      updated_stock = Number(previous_stock) - Number(quantity);
    }

    if (updated_stock < 0) throw new Error('Insufficient stock');

    await inventoryModel.update(id, { 
      current_stock: updated_stock,
      status: updated_stock <= item.threshold ? 'low_stock' : 'in_stock'
    });

    await inventoryModel.logAction(id, {
      action_type: actionType,
      quantity,
      previous_stock,
      updated_stock,
      performed_by: userId
    });

    // Notify if low stock
    if (updated_stock <= item.threshold) {
      const io = getIO();
      io.emit('low_stock_alert', { id, product_name: item.product_name, current_stock: updated_stock });
    }

    return updated_stock;
  }

  async addItem(data) {
    const payload = {
      inventory_code: data.inventory_code || `INV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      product_name: data.name,
      category: data.category,
      current_stock: data.stock,
      unit: data.unit,
      threshold: data.minStock,
      unit_price: data.price,
      status: data.stock <= data.minStock ? 'low_stock' : 'in_stock'
    };
    return await inventoryModel.create(payload);
  }

  async deleteItem(id) {
    return await inventoryModel.softDelete(id);
  }
}

module.exports = new InventoryService();
