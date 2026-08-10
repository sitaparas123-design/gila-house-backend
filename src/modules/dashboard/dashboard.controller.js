const dashboardService = require('./dashboard.service');

class DashboardController {
  async getStats(req, res) {
    try {
      // Allow all authenticated staff/customers to view stats, 
      // the dashboard frontend handles role-based display
      const data = await dashboardService.getAdminStats(req.query);

      res.json({
        success: true,
        message: 'Dashboard stats fetched successfully',
        data
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async getReports(req, res) {
    try {
      const data = await dashboardService.getReports(req.query);
      res.json({
        success: true,
        message: 'Reports fetched successfully',
        data
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async getHeatmap(req, res) {
    try {
      const data = await dashboardService.getTrafficHeatmap();
      res.json({
        success: true,
        message: 'Heatmap fetched successfully',
        data
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async getActivityLogs(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const data = await dashboardService.getActivityLogs(limit);
      res.json({
        success: true,
        message: 'Activity logs fetched successfully',
        data
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new DashboardController();
