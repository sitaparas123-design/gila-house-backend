const pool = require('./src/database/connection');

async function run() {
  try {
    const [cats] = await pool.execute('SELECT * FROM menu_categories WHERE deletedAt IS NULL');
    const [items] = await pool.execute('SELECT id, item_name, category_id, price FROM menu_items WHERE deletedAt IS NULL');
    console.log('--- CATEGORIES ---');
    console.log(cats);
    console.log('--- ITEMS ---');
    console.log(items);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
