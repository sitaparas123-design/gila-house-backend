const pool = require('./src/database/connection');

async function check() {
  const [cols] = await pool.query("DESCRIBE users");
  console.log('Users columns:', cols.map(c => c.Field));
  process.exit();
}
check();
