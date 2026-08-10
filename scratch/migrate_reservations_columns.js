const pool = require('../src/database/connection');

async function migrate() {
  try {
    console.log('Starting migration for reservations table...');
    
    // Check if table_id column exists
    const [tableIdCols] = await pool.execute("SHOW COLUMNS FROM reservations LIKE 'table_id'");
    if (tableIdCols.length === 0) {
      console.log('Adding table_id column to reservations...');
      await pool.execute('ALTER TABLE reservations ADD COLUMN table_id INT NULL AFTER guest_id');
      console.log('table_id added.');
    }

    // Check if room_id column exists
    const [roomIdCols] = await pool.execute("SHOW COLUMNS FROM reservations LIKE 'room_id'");
    if (roomIdCols.length === 0) {
      console.log('Adding room_id column to reservations...');
      await pool.execute('ALTER TABLE reservations ADD COLUMN room_id INT NULL AFTER table_id');
      console.log('room_id added.');
    }
    
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
