const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../src/database/connection');

async function checkRoles() {
  try {
    const [roles] = await pool.execute('SELECT * FROM roles');
    console.log('Roles in DB:', roles);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkRoles();
