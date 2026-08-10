const pool = require('./connection');

const fix = async () => {
  try {
    console.log('Altering table columns to support large base64 images...');
    
    await pool.execute('ALTER TABLE menu_items MODIFY COLUMN image LONGTEXT');
    console.log('menu_items.image modified to LONGTEXT');
    
    await pool.execute('ALTER TABLE users MODIFY COLUMN avatar LONGTEXT');
    console.log('users.avatar modified to LONGTEXT');
    
    await pool.execute('ALTER TABLE qr_codes MODIFY COLUMN qr_image LONGTEXT');
    console.log('qr_codes.qr_image modified to LONGTEXT');

    console.log('Database columns updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err.message);
    process.exit(1);
  }
};

fix();
