const pool = require('./src/database/connection');
const queries = require('./src/modules/orders/orders.sql');

async function test() {
  try {
    await pool.execute(queries.findWithItems + ' ORDER BY o.createdAt DESC');
    console.log('Query successful');
  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
test();
