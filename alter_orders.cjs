const pool = require('./src/database/connection');

async function run() {
  try {
    console.log('Altering orders table to add payment_method column...');
    await pool.execute('ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL AFTER payment_status');
    console.log('✅ Column payment_method successfully added to orders table!');
    process.exit(0);
  } catch (err) {
    console.error('Error altering table:', err);
    process.exit(1);
  }
}
run();
