const bcrypt = require('bcryptjs');
const pool = require('./connection');

const seed = async () => {
  try {
    console.log('Seeding database...');

    // 1. Roles
    const roles = [
      ['admin', 'Full System Access'],
      ['manager', 'Operational Control'],
      ['waiter', 'Order Handling'],
      ['chef', 'Kitchen Operations'],
      ['cashier', 'Billing & Payments'],
      ['customer', 'QR Ordering & Guest Access']
    ];

    for (const role of roles) {
      await pool.execute(
        'INSERT IGNORE INTO roles (role_name, description) VALUES (?, ?)',
        role
      );
    }
    console.log('Roles seeded.');

    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const managerHash = await bcrypt.hash('Manager@123', 10);
    const waiterHash = await bcrypt.hash('Waiter@123', 10);
    const chefHash = await bcrypt.hash('Chef@123', 10);
    const cashierHash = await bcrypt.hash('Cashier@123', 10);
    const customerHash = await bcrypt.hash('Customer@123', 10);

    const users = [
      ['System Admin', 'admin@gilahouse.com', passwordHash, 1],
      ['Kitchen Manager', 'manager@gilahouse.com', managerHash, 2],
      ['Service Waiter', 'waiter@gilahouse.com', waiterHash, 3],
      ['Head Chef', 'chef@gilahouse.com', chefHash, 4],
      ['Billing Cashier', 'cashier@gilahouse.com', cashierHash, 5],
      ['Guest Customer', 'customer@gilahouse.com', customerHash, 6]
    ];

    for (const user of users) {
      await pool.execute(
        'INSERT IGNORE INTO users (full_name, email, password, role_id, status) VALUES (?, ?, ?, ?, "active")',
        user
      );
    }
    console.log('Users seeded.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
