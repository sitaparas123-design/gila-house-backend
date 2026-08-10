require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrateStatuses() {
  console.log("Connecting to Database:", process.env.DB_HOST);
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  try {
    const alterQuery = `
      ALTER TABLE orders 
      MODIFY COLUMN order_status 
      ENUM(
        'new', 'pending', 'cooking', 'ready', 'delivered', 'cancelled',
        'Draft', 'Waiting Payment', 'Paid', 'Confirmed', 'Preparing', 'Served', 'Completed', 'Refunded'
      ) DEFAULT 'Waiting Payment';
    `;
    
    console.log("Running migration...");
    await pool.query(alterQuery);
    console.log("Migration successful! Order statuses updated.");
    
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrateStatuses();
