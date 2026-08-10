const inventoryService = require('./inventory.service');

class InventoryController {
  async getAllStock(req, res) {
    try {
      const items = await inventoryService.getAllStock();
      res.json({
        success: true,
        message: 'Inventory fetched successfully',
        data: items
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, actionType } = req.body;
      const updatedStock = await inventoryService.updateStock(id, quantity, actionType, req.user.id);
      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: { current_stock: updatedStock }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async addInventoryItem(req, res) {
    try {
      const itemId = await inventoryService.addItem(req.body);
      res.status(201).json({
        success: true,
        message: 'Item added successfully',
        data: { id: itemId }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async deleteInventoryItem(req, res) {
    try {
      await inventoryService.deleteItem(req.params.id);
      res.json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new InventoryController();
