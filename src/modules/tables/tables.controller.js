const tablesService = require('./tables.service');

class TablesController {
  async getAllTables(req, res) {
    try {
      const tables = await tablesService.getAllTables();
      res.json({
        success: true,
        message: 'Tables fetched successfully',
        data: tables
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async getZones(req, res) {
    try {
      const zones = await tablesService.getZones();
      res.json({
        success: true,
        message: 'Zones fetched successfully',
        data: zones
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status, ...extraData } = req.body;
      await tablesService.updateTableStatus(req.params.id, status, Object.keys(extraData).length > 0 ? extraData : null);
      res.json({
        success: true,
        message: 'Table status updated successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async createTable(req, res) {
    try {
      const tableId = await tablesService.createTable(req.body);
      res.status(201).json({
        success: true,
        message: 'Table created successfully',
        data: { id: tableId }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async deleteTable(req, res) {
    try {
      await tablesService.deleteTable(req.params.id);
      res.json({
        success: true,
        message: 'Table deleted successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new TablesController();
