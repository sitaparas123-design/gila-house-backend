const exceljs = require('exceljs');
const pool = require('../database/connection');
const emailService = require('./email.service');
const path = require('path');
const fs = require('fs');

class ReportService {
  /**
   * Fetch payment data from database based on date range
   */
  async getPaymentsByDateRange(startDate, endDate) {
    const query = `
      SELECT 
        invoice_id, 
        booking_id, 
        guest_name, 
        email, 
        amount, 
        paid_amount, 
        status, 
        paid_at, 
        created_at 
      FROM payment_invoices 
      WHERE status = 'PAID' AND paid_at BETWEEN ? AND ?
      ORDER BY paid_at DESC
    `;
    const [rows] = await pool.execute(query, [startDate, endDate]);
    return rows;
  }

  /**
   * Generate an Excel file and send it via Email
   */
  async generateAndSendReport(type) {
    let startDate = new Date();
    let endDate = new Date();
    
    // Set time boundaries based on type
    if (type === 'daily') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (type === 'weekly') {
      // Go back 7 days
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (type === 'monthly') {
      // First day of current month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      throw new Error("Invalid report type");
    }

    try {
      const payments = await this.getPaymentsByDateRange(startDate, endDate);
      
      if (payments.length === 0) {
        console.log(`[Report Service] No paid payments found for ${type} report. Skipping email.`);
        return;
      }

      // Initialize Excel Workbook
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Payments');

      // Define columns
      worksheet.columns = [
        { header: 'Invoice ID', key: 'invoice_id', width: 30 },
        { header: 'Booking ID', key: 'booking_id', width: 20 },
        { header: 'Guest Name', key: 'guest_name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Paid Amount', key: 'paid_amount', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Paid At', key: 'paid_at', width: 25 },
      ];

      // Add Data
      payments.forEach(payment => {
        worksheet.addRow({
          invoice_id: payment.invoice_id,
          booking_id: payment.booking_id,
          guest_name: payment.guest_name,
          email: payment.email,
          amount: payment.amount,
          paid_amount: payment.paid_amount,
          status: payment.status,
          paid_at: new Date(payment.paid_at).toLocaleString(),
        });
      });

      // Style header row
      worksheet.getRow(1).font = { bold: true };

      // Generate temporary file path
      const tempDir = path.join(__dirname, '..', '..', 'tmp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      const fileName = `GilaHouse_${type.toUpperCase()}_Payment_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      const filePath = path.join(tempDir, fileName);

      // Save file
      await workbook.xlsx.writeFile(filePath);

      // Send Email
      const toEmails = process.env.NOTIFICATION_EMAILS;
      if (toEmails) {
        const subject = `Gila House - ${type.charAt(0).toUpperCase() + type.slice(1)} Payment Report`;
        const html = `
          <h2>${type.charAt(0).toUpperCase() + type.slice(1)} Payment Report</h2>
          <p>Please find attached the ${type} payment report for tax and consulting purposes.</p>
          <p>Total successful transactions: <strong>${payments.length}</strong></p>
          <br/>
          <p>Regards,<br/>Gila House System</p>
        `;

        const attachments = [
          {
            filename: fileName,
            path: filePath
          }
        ];

        await emailService.sendEmail(toEmails, subject, html, attachments);
        console.log(`[Report Service] ${type} report sent successfully.`);
      }

      // Cleanup temp file
      fs.unlinkSync(filePath);

    } catch (error) {
      console.error(`[Report Service] Error generating ${type} report:`, error);
    }
  }
}

module.exports = new ReportService();
