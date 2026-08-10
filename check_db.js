const pool = require('./src/database/connection');

async function checkRoles() {
  try {
    const [rows] = await pool.execute('SELECT * FROM roles');
    console.log('Roles:', JSON.stringify(rows, null, 2));
    
    const [users] = await pool.execute(`
      SELECT u.email, r.role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id
    `);
    console.log('Users and Roles:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkRoles();
