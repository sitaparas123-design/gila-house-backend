const pool = require('../src/database/connection');

async function migrate() {
  try {
    await pool.execute("ALTER TABLE tasks ADD COLUMN description TEXT AFTER title;");
    console.log("Column 'description' added to 'tasks' table.");
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Column 'description' already exists.");
      process.exit(0);
    }
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
