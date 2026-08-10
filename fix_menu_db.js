const pool = require('./src/database/connection');

(async () => {
  try {
    console.log('Starting Menu database updates...');
    
    // 1. Update image column for Base64 support
    await pool.execute('ALTER TABLE menu_items MODIFY COLUMN image LONGTEXT');
    console.log('✅ Image column is now LONGTEXT');

    // 2. Update availability to support string states
    await pool.execute('ALTER TABLE menu_items MODIFY COLUMN availability VARCHAR(20) DEFAULT "In Stock"');
    console.log('✅ Availability column is now VARCHAR(20)');

    // 3. Ensure rating column exists (DECIMAL 3,1 for 0.0 to 5.0)
    try {
      await pool.execute('ALTER TABLE menu_items ADD COLUMN rating DECIMAL(3, 1) DEFAULT 5.0');
      console.log('✅ Rating column added');
    } catch (e) {
      console.log('ℹ️ Rating column already exists or update skipped');
    }

    // 4. Ensure popular column exists
    try {
      await pool.execute('ALTER TABLE menu_items ADD COLUMN popular TINYINT(1) DEFAULT 0');
      console.log('✅ Popular column added');
    } catch (e) {
      console.log('ℹ️ Popular column already exists or update skipped');
    }

    console.log('🚀 All Menu database updates completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update menu database:', err);
    process.exit(1);
  }
})();
