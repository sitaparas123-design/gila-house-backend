const pool = require('../src/database/connection');

async function migrate() {
  try {
    console.log('Starting migration for rooms table...');
    
    // Check if base_rate column exists
    const [columns] = await pool.execute("SHOW COLUMNS FROM rooms LIKE 'base_rate'");
    
    if (columns.length === 0) {
      console.log('Adding base_rate column to rooms table...');
      await pool.execute('ALTER TABLE rooms ADD COLUMN base_rate DECIMAL(10, 2) DEFAULT 0.00 AFTER capacity');
      console.log('base_rate column added successfully.');
    } else {
      console.log('base_rate column already exists.');
    }
    
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
