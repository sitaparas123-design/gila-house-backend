require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  console.log("Testing Nodemailer with provided credentials...");
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // 465 requires secure: true
    auth: {
      user: 'info@gilahouse.com',
      pass: 'zhia-5bpl-ystu-vion',
    },
    // Adding debug and logger flags to get more detailed errors
    debug: true,
    logger: true
  });

  try {
    const info = await transporter.sendMail({
      from: '"Gila House ERP" <info@gilahouse.com>',
      to: 'info@gilahouse.com', // sending to self for testing
      subject: 'Test Email',
      html: '<p>Test email</p>'
    });
    console.log("Success:", info.messageId);
  } catch (err) {
    console.error("Failed:", err.message);
    console.error(err);
  }
}

test();
