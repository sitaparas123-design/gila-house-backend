const pool = require('./src/database/connection');

async function initCoupons() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS coupons (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          discount_type ENUM('percentage', 'flat') NOT NULL,
          discount_value DECIMAL(10, 2) NOT NULL,
          min_order_amount DECIMAL(10, 2) DEFAULT 0,
          max_discount_amount DECIMAL(10, 2) DEFAULT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.execute(createTableQuery);
    console.log('Coupons table created or already exists.');

    // Seed data
    const seedQuery = `
      INSERT IGNORE INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount)
      VALUES 
      ('GILA50', 'flat', 50.00, 200.00, NULL),
      ('FIRST10', 'percentage', 10.00, 0, 100.00),
      ('FREEDESSERT', 'flat', 0.00, 0, NULL),
      ('HAPPYHOUR', 'percentage', 20.00, 0, NULL)
    `;
    
    await pool.execute(seedQuery);
    console.log('Seed coupons inserted.');
    
  } catch (error) {
    console.error('Error initializing coupons:', error);
  } finally {
    process.exit(0);
  }
}

initCoupons();
