require('dotenv').config();
const authService = require('../src/modules/auth/auth.service');
const pool = require('../src/database/connection');

async function debugForgot() {
  try {
    const email = "sullereshrikant19@gmail.com";
    console.log("Checking if user exists in DB...");
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      console.log(`User ${email} DOES NOT EXIST in the database.`);
    } else {
      console.log(`User ${email} exists. ID: ${rows[0].id}, Status: ${rows[0].status}`);
      console.log("Attempting to run authService.requestPasswordReset...");
      await authService.requestPasswordReset(email);
      console.log("Successfully ran requestPasswordReset! OTP email sent.");
    }
  } catch (error) {
    console.error("Error during requestPasswordReset:", error.message);
  } finally {
    process.exit(0);
  }
}

debugForgot();
