const pool = require('../src/database/connection');
const bcrypt = require('bcryptjs');

async function checkAndCreateAdmin() {
  try {
    console.log('Checking for admin user in Railway DB...');
    
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', ['admin@gilahouse.com']);
    
    if (users.length === 0) {
      console.log('Admin user not found. Creating admin user...');
      
      // Get role ID for admin
      const [roles] = await pool.execute('SELECT id FROM roles WHERE role_name = ?', ['admin']);
      if (roles.length === 0) {
        console.error('Admin role not found in database! Please run migrations first.');
        process.exit(1);
      }
      const roleId = roles[0].id;
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.execute(
        'INSERT INTO users (full_name, email, password, role_id, status) VALUES (?, ?, ?, ?, ?)',
        ['System Admin', 'admin@gilahouse.com', hashedPassword, roleId, 'active']
      );
      
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists. Updating password to admin123...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@gilahouse.com']);
      console.log('Admin password updated successfully.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAndCreateAdmin();
