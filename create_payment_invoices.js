const pool = require('./src/database/connection');

async function createTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS payment_invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(100) NOT NULL,
        external_id VARCHAR(150) NOT NULL UNIQUE,
        invoice_id VARCHAR(150) NOT NULL,
        guest_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50),
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'PENDING',
        invoice_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await pool.execute(query);
    console.log("Table 'payment_invoices' created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
}

createTable();
