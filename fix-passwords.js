const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fixPasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'restaurantpos'
  });

  const users = [
    { email: 'admin@gilahouse.com', password: 'admin123' },
    { email: 'manager@gilahouse.com', password: 'manager123' },
    { email: 'waiter@gilahouse.com', password: 'waiter123' },
    { email: 'chef@gilahouse.com', password: 'chef123' },
    { email: 'cashier@gilahouse.com', password: 'cashier123' },
    { email: 'customer@gilahouse.com', password: 'customer123' }
  ];

  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    await connection.execute('UPDATE users SET password = ? WHERE email = ?', [hash, user.email]);
    console.log(`Updated password for ${user.email}`);
  }

  await connection.end();
  console.log('Done!');
}

fixPasswords().catch(console.error);
