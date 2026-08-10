require('dotenv').config();
const emailService = require('./src/services/email.service');
const reportService = require('./src/services/report.service');

async function test() {
  console.log("Testing Email Service...");
  const to = process.env.NOTIFICATION_EMAILS;
  if(!to) {
      console.error("NOTIFICATION_EMAILS not set in .env");
      return;
  }
  
  console.log(`Sending test email to: ${to}`);
  const success = await emailService.sendEmail(
      to, 
      "Test Email - Gila House POS", 
      "<h1>This is a test email</h1><p>Your SMTP is configured correctly!</p>"
  );
  
  if (success) {
      console.log("Email sent successfully!");
  } else {
      console.error("Failed to send email.");
  }
}

test();
