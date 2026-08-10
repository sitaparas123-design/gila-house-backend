const pool = require('./src/database/connection');

async function migrate() {
  try {
    // Ensure bookings table exists (if it doesn't, create a basic one based on requirements)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        booking_id VARCHAR(100) PRIMARY KEY,
        guest_name VARCHAR(150),
        email VARCHAR(150),
        phone VARCHAR(50),
        booking_status VARCHAR(50) DEFAULT 'PENDING',
        payment_status VARCHAR(50) DEFAULT 'UNPAID',
        payment_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create booking_logs table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS booking_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Migration for bookings and booking_logs successful!");
    process.exit(0);
  } catch (error) {
    console.error("Migration Error:", error);
    process.exit(1);
  }
}

migrate();
