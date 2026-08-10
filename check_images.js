const pool = require('./src/database/connection');

async function check() {
  const [cols] = await pool.query("DESCRIBE menu_items");
  console.log('Columns:', cols.filter(c => c.Field === 'image'));
  process.exit();
}
check();
