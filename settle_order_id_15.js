const pool = require('./src/database/connection');

async function settleOrder() {
    try {
        console.log('Setting payment_status to "paid" for order 15...');
        const [result] = await pool.execute('UPDATE orders SET payment_status = "paid" WHERE id = 15');
        console.log('Update result:', result);
    } catch (error) {
        console.error('Error updating order:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

settleOrder();
