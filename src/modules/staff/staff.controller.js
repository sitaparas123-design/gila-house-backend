const staffService = require('./staff.service');

class StaffController {
  async getAllStaff(req, res) {
    try {
      const staff = await staffService.getAllStaff();
      res.json({
        success: true,
        message: 'Staff fetched successfully',
        data: staff
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async createStaff(req, res) {
    try {
      const staffId = await staffService.createStaff(req.body);
      res.status(201).json({
        success: true,
        message: 'Staff created successfully',
        data: { id: staffId }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async updateStaff(req, res) {
    try {
      await staffService.updateStaff(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Staff updated successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async deleteStaff(req, res) {
    try {
      await staffService.deleteStaff(req.params.id);
      res.json({
        success: true,
        message: 'Staff deleted successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new StaffController();
