const settingsModel = require('./settings.model');

class SettingsService {
  async getSettings() {
    return await settingsModel.getAll();
  }

  async updateSettings(settings) {
    return await settingsModel.updateBatch(settings);
  }
}

module.exports = new SettingsService();
