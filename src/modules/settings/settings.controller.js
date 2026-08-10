const settingsService = require('./settings.service');

class SettingsController {
  async getSettings(req, res) {
    try {
      const data = await settingsService.getSettings();
      res.json({
        success: true,
        message: 'Settings fetched successfully',
        data
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async updateSettings(req, res) {
    try {
      await settingsService.updateSettings(req.body);
      res.json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new SettingsController();
