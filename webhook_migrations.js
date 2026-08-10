const pool = require('./src/database/connection');

async function migrate() {
  try {
    // 1. Add new columns to payment_invoices
    try {
      await pool.execute(`
        ALTER TABLE payment_invoices
        ADD COLUMN paid_amount DECIMAL(10, 2) DEFAULT 0,
        ADD COLUMN paid_at TIMESTAMP NULL
      `);
      console.log("Added 'paid_amount' and 'paid_at' columns to payment_invoices.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("Columns 'paid_amount' or 'paid_at' already exist.");
      } else {
        throw e;
      }
    }

    // 2. Create payment_logs table
    const createLogsTable = `
      CREATE TABLE IF NOT EXISTS payment_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id VARCHAR(150) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        payload JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.execute(createLogsTable);
    console.log("Table 'payment_logs' created successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Migration Error:", error);
    process.exit(1);
  }
}

migrate();
