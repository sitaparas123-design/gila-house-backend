const pool = require('./src/database/connection');

async function checkServices() {
  const [rows] = await pool.query('SELECT * FROM services');
  console.log(rows);
  process.exit();
}
checkServices();
