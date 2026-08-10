const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionConfig = process.env.MYSQL_URL || process.env.DATABASE_URL ? {
  uri: process.env.MYSQL_URL || process.env.DATABASE_URL
} : {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 3306
};

const pool = mysql.createPool({
  ...connectionConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.MYSQL_URL || process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

// Wrapper to prevent "undefined" in bind parameters
const originalExecute = pool.execute.bind(pool);
const originalQuery = pool.query.bind(pool);

pool.execute = async (sql, params) => {
  const processedParams = Array.isArray(params) 
    ? params.map(p => p === undefined ? null : p) 
    : params;
  return originalExecute(sql, processedParams);
};

pool.query = async (sql, params) => {
  const processedParams = Array.isArray(params) 
    ? params.map(p => p === undefined ? null : p) 
    : params;
  return originalQuery(sql, processedParams);
};

// Test connection
(async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to MySQL database: ' + (process.env.DB_NAME || 'restaurantpos'));
    
    // Auto-fix schema for settlements.id if AUTO_INCREMENT is missing
    try {
      const [columns] = await connection.execute('DESCRIBE settlements');
      const idCol = columns.find(col => col.Field === 'id');
      if (idCol && !idCol.Extra.includes('auto_increment')) {
        console.log('Fixing settlements table: adding AUTO_INCREMENT to id column...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('ALTER TABLE settlements MODIFY COLUMN id INT AUTO_INCREMENT');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('settlements table schema fixed successfully.');
      }
    } catch (schemaErr) {
      console.error('Failed to verify or fix settlements schema on startup:', schemaErr.message);
    }
  } catch (err) {
    console.error('Database connection failed: ' + err.message);
  } finally {
    if (connection) connection.release();
  }
})();

module.exports = pool;
