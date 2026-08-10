const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to, subject, html, attachments = []) {
    try {
      if (!process.env.SMTP_USER) {
        logger.warn('SMTP credentials not configured. Skipping email send.');
        return false;
      }
      
      const info = await this.transporter.sendMail({
        from: `"Gila House ERP" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments,
      });

      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
