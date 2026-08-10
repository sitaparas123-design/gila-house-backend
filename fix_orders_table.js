const pool = require('./src/database/connection');

async function fixOrdersTable() {
    try {
        console.log('Starting Orders table update...');
        
        // 1. Add user_id column if it doesn't exist
        const [columns] = await pool.execute('SHOW COLUMNS FROM orders LIKE "user_id"');
        if (columns.length === 0) {
            console.log('Adding user_id column to orders table...');
            await pool.execute('ALTER TABLE orders ADD COLUMN user_id INT NULL AFTER customer_id');
            await pool.execute('ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)');
            console.log('user_id column added successfully.');
        } else {
            console.log('user_id column already exists.');
        }

        // 2. Ensure guest name join works for users too in queries
        console.log('Orders table is ready.');
        
    } catch (error) {
        console.error('Error updating orders table:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

fixOrdersTable();
