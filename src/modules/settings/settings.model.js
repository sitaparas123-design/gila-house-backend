const pool = require('../../database/connection');

class SettingsModel {
  async getAll() {
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM app_settings');
    const settings = {};
    rows.forEach(row => {
      let value = row.setting_value;
      // Try to parse JSON for complex fields
      if (value.startsWith('{') || value.startsWith('[')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string
        }
      } else if (value === 'true' || value === '1') {
        value = true;
      } else if (value === 'false' || value === '0') {
        value = false;
      }
      
      settings[row.setting_key] = value;
    });
    return settings;
  }

  async update(key, value) {
    let finalValue;
    if (typeof value === 'object' && value !== null) {
      finalValue = JSON.stringify(value);
    } else if (typeof value === 'boolean') {
      finalValue = value ? '1' : '0';
    } else {
      finalValue = String(value);
    }
    
    const [result] = await pool.execute(
      'INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [key, finalValue, finalValue]
    );
    return result;
  }

  async updateBatch(settings) {
    const promises = Object.entries(settings).map(([key, value]) => this.update(key, value));
    return await Promise.all(promises);
  }
}

module.exports = new SettingsModel();
