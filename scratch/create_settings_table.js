const pool = require('../src/database/connection');
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Table app_settings created or already exists");
    
    // Check if default settings exist, if not, seed them
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM app_settings');
    if (rows[0].count === 0) {
      const defaultSettings = {
        businessName: 'The Royal Kitchen',
        email: 'admin@royalkitchen.com',
        phone: '+00 12345 67890',
        address: '123, Foodie Street, Bangalore, KA 560001',
        currency: 'INR (₹)',
        timezone: '(GMT+05:30) India Standard Time',
        taxRate: '18',
        serviceCharge: '5',
        invoicePrefix: 'TRK-',
        notifyEmail: '1',
        notifySMS: '0',
        orderAlerts: '1',
        kitchenAlerts: '1',
        printerIp: '192.168.1.105',
        printerConnected: '1',
        themeColor: 'indigo',
        motto: 'Serving Excellence Since 2024',
        operatingHours: JSON.stringify({
          Monday: { open: '09:00', close: '23:00', active: true },
          Tuesday: { open: '09:00', close: '23:00', active: true },
          Wednesday: { open: '09:00', close: '23:00', active: true },
          Thursday: { open: '09:00', close: '23:00', active: true },
          Friday: { open: '09:00', close: '23:00', active: true },
          Saturday: { open: '10:00', close: '23:59', active: true },
          Sunday: { open: '10:00', close: '22:00', active: true },
        })
      };
      
      for (const [key, value] of Object.entries(defaultSettings)) {
        await pool.query('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)', [key, value]);
      }
      console.log("Default settings seeded");
    }
  } catch (err) {
    console.error("Error creating/seeding settings table:", err);
  } finally {
    process.exit();
  }
})();
