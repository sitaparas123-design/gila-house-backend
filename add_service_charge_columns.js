const pool = require('./src/database/connection');

async function addServiceChargeColumns() {
    try {
        console.log('Starting Service Charge columns update...');
        
        // 1. Add service_charge_percent column if it doesn't exist
        const [percentCol] = await pool.execute('SHOW COLUMNS FROM orders LIKE "service_charge_percent"');
        if (percentCol.length === 0) {
            console.log('Adding service_charge_percent column to orders table...');
            await pool.execute('ALTER TABLE orders ADD COLUMN service_charge_percent DECIMAL(5, 2) DEFAULT 0.00 AFTER discount');
            console.log('service_charge_percent column added successfully.');
        } else {
            console.log('service_charge_percent column already exists.');
        }

        // 2. Add service_charge_amount column if it doesn't exist
        const [amountCol] = await pool.execute('SHOW COLUMNS FROM orders LIKE "service_charge_amount"');
        if (amountCol.length === 0) {
            console.log('Adding service_charge_amount column to orders table...');
            await pool.execute('ALTER TABLE orders ADD COLUMN service_charge_amount DECIMAL(10, 2) DEFAULT 0.00 AFTER service_charge_percent');
            console.log('service_charge_amount column added successfully.');
        } else {
            console.log('service_charge_amount column already exists.');
        }

        console.log('Orders table updated successfully with Service Charge columns.');
        
    } catch (error) {
        console.error('Error updating orders table:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

addServiceChargeColumns();
