const pool = require('./src/database/connection');

async function run() {
  try {
    const [cols] = await pool.execute('DESCRIBE notifications');
    console.log('--- COLUMNS ---');
    console.log(cols);
    const [rows] = await pool.execute('SELECT * FROM notifications ORDER BY createdAt DESC LIMIT 5');
    console.log('--- ROWS ---');
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
