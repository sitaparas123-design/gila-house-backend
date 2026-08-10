const pool = require('./src/database/connection');

async function run() {
  try {
    const [columns] = await pool.execute('DESCRIBE orders');
    console.log('--- ORDERS COLUMNS ---');
    console.log(columns);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
