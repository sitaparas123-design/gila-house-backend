const pool = require('./src/database/connection');

async function checkLastOrders() {
    try {
        console.log('Querying last 5 orders...');
        const [rows] = await pool.execute('SELECT id, order_number, order_type, subtotal, tax, discount, service_charge_percent, service_charge_amount, grand_total, payment_status, order_status, createdAt FROM orders ORDER BY id DESC LIMIT 5');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error fetching orders:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

checkLastOrders();
