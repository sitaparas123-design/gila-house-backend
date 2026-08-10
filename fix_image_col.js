const pool = require('./src/database/connection');

(async () => {
  try {
    await pool.execute('ALTER TABLE menu_items MODIFY COLUMN image LONGTEXT');
    console.log('Table menu_items altered successfully. Image column is now LONGTEXT.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to alter table:', err);
    process.exit(1);
  }
})();
