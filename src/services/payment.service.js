const { xenditClient } = require('../config/xendit');
const pool = require('../database/connection');

class PaymentService {
  /**
   * Health check to test Xendit module configuration
   */
  async testConnection() {
    try {
      return {
        success: true,
        message: 'Xendit Payment Module Working'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create Xendit Invoice and store in database
   */
  async createInvoice(data) {
    const { bookingId, guestName, email, phone, amount, description, paymentMethods } = data;
    
    // Generate unique external_id
    const externalId = `${bookingId}_${Math.floor(Date.now() / 1000)}`;

    try {
      // Create invoice via Xendit SDK
      const invoice = await xenditClient.Invoice.createInvoice({
        data: {
          externalId: externalId,
          amount: amount,
          description: description,
          payerEmail: email,
          customer: {
            givenNames: guestName,
            email: email,
            mobileNumber: phone || undefined
          },
          paymentMethods: paymentMethods || undefined,
          // redirectUrl: process.env.APP_URL + '/success' // optional
        }
      });

      // Insert into database
      const query = `
        INSERT INTO payment_invoices 
        (booking_id, external_id, invoice_id, guest_name, email, phone, amount, description, status, invoice_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        bookingId,
        externalId,
        invoice.id,
        guestName,
        email,
        phone || null,
        amount,
        description,
        invoice.status || 'PENDING',
        invoice.invoiceUrl
      ];

      await pool.execute(query, values);

      return {
        success: true,
        invoiceId: invoice.id,
        externalId: externalId,
        invoiceUrl: invoice.invoiceUrl,
        status: invoice.status || 'PENDING'
      };
    } catch (error) {
      console.error('Xendit Create Invoice Error:', error);
      throw error;
    }
  }

  /**
   * Create Xendit Dynamic QR Code
   */
  async createQrCode(data) {
    const { bookingId, amount, description } = data;
    
    // Generate unique external_id
    const externalId = `${bookingId}_${Math.floor(Date.now() / 1000)}`;

    try {
      // Create QR Code via Xendit SDK PaymentRequest API
      const paymentRequest = await xenditClient.PaymentRequest.createPaymentRequest({
        data: {
          referenceId: externalId,
          amount: amount,
          currency: 'IDR',
          paymentMethod: {
            type: 'QR_CODE',
            reusability: 'ONE_TIME_USE',
            qrCode: {
               channelCode: 'QRIS'
            }
          }
        }
      });

      // Insert into database
      const query = `
        INSERT INTO payment_invoices 
        (booking_id, external_id, invoice_id, guest_name, email, amount, description, status, invoice_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        bookingId,
        externalId,
        paymentRequest.id,
        "Walk-in Guest", // Default
        "guest@gilahouse.com", // Default
        amount,
        description,
        paymentRequest.status || 'ACTIVE',
        paymentRequest.paymentMethod.qrCode.channelProperties.qrString // Store qrString in invoice_url column for convenience
      ];

      await pool.execute(query, values);

      return {
        success: true,
        invoiceId: paymentRequest.id,
        externalId: externalId,
        invoiceUrl: paymentRequest.paymentMethod.qrCode.channelProperties.qrString, // Return qrString so frontend can render it
        status: paymentRequest.status || 'ACTIVE'
      };
    } catch (error) {
      if (error.response && error.response.error_code === 'CHANNEL_NOT_ACTIVATED') {
        throw new Error('Please activate the QRIS channel in your Xendit Dashboard settings to use direct Scan & Pay.');
      }
      console.error('Xendit Create QR Code Error:', error);
      throw new Error(error.response?.message || error.message || 'Failed to create QR code');
    }
  }

  /**
   * Handle incoming Xendit webhook with Transaction
   */
  async handleWebhook(payload) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const isQrPayment = payload.event && payload.event.startsWith('qr.');
      const data = isQrPayment ? payload.data : payload;
      
      const invoiceId = data.id;
      const externalId = data.reference_id || data.external_id;
      // Normal invoices use PAID, QR codes use COMPLETED
      let status = data.status;
      if (isQrPayment && status === 'COMPLETED') status = 'PAID';
      
      const paid_amount = data.amount || data.paid_amount;
      const paid_at = data.created || data.paid_at;

      if (!invoiceId) {
        throw new Error('Invoice/QR ID missing from webhook payload');
      }

      // Log the webhook in payment_logs
      const logQuery = `INSERT INTO payment_logs (invoice_id, event_type, payload) VALUES (?, ?, ?)`;
      await connection.execute(logQuery, [invoiceId, status || 'UNKNOWN', JSON.stringify(payload)]);

      // Update payment_invoices status
      await this.updatePaymentStatus(invoiceId, externalId, status, paid_amount, paid_at, connection);

      // Extract bookingId from externalId if possible, or query payment_invoices
      let bookingId = externalId ? externalId.split('_')[0] : null;
      if (!bookingId) {
        const [rows] = await connection.execute('SELECT booking_id FROM payment_invoices WHERE invoice_id = ? LIMIT 1', [invoiceId]);
        if (rows.length > 0) bookingId = rows[0].booking_id;
      }

      // If status is PAID, update the booking
      if (status === 'PAID' && bookingId) {
        await this.confirmBookingAfterPayment(bookingId, connection);
        
        // Send instant email notification
        const toEmails = process.env.NOTIFICATION_EMAILS;
        if (toEmails) {
          const subject = `Payment Received - Booking #${bookingId}`;
          const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #4CAF50;">Payment Received Successfully</h2>
              <p>Hello Admin,</p>
              <p>A payment has been successfully processed via Xendit.</p>
              <table style="width: 100%; max-width: 400px; border-collapse: collapse; margin-top: 15px;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Booking ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingId}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Invoice ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${invoiceId}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount Paid:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">IDR ${paid_amount}</td></tr>
              </table>
              <p style="margin-top: 20px;">Please check the dashboard for more details.</p>
            </div>
          `;
          const emailService = require('./email.service');
          emailService.sendEmail(toEmails, subject, html).catch(err => console.error("Email Notification Error:", err));
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Webhook Handling Error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update the payment status in payment_invoices
   */
  async updatePaymentStatus(invoiceId, externalId, status, paidAmount, paidAt, connection) {
    let updateQuery = `UPDATE payment_invoices SET status = ?, updated_at = CURRENT_TIMESTAMP`;
    const updateValues = [status];

    if (status === 'PAID') {
      updateQuery += `, paid_amount = ?, paid_at = ?`;
      updateValues.push(paidAmount || 0, paidAt ? new Date(paidAt) : new Date());
    }

    updateQuery += ` WHERE invoice_id = ? OR external_id = ?`;
    updateValues.push(invoiceId, externalId || '');

    await connection.execute(updateQuery, updateValues);
  }

  /**
   * Automatically update booking upon successful payment
   */
  async confirmBookingAfterPayment(bookingId, connection) {
    // 1. Check if booking is already confirmed to prevent duplicates
    const [bookings] = await connection.execute('SELECT booking_status FROM bookings WHERE booking_id = ? FOR UPDATE', [bookingId]);
    
    if (bookings.length === 0) {
      console.warn(`Booking ID ${bookingId} not found in bookings table.`);
      return; // Skip if not found
    }

    if (bookings[0].booking_status === 'CONFIRMED') {
      console.log(`Booking ID ${bookingId} is already CONFIRMED. Skipping update.`);
      return;
    }

    // 2. Update booking table
    const updateBookingQuery = `
      UPDATE bookings 
      SET booking_status = 'CONFIRMED', 
          payment_status = 'PAID', 
          payment_date = CURRENT_TIMESTAMP 
      WHERE booking_id = ?
    `;
    await connection.execute(updateBookingQuery, [bookingId]);

    // 3. Create booking log
    await this.createBookingLog(
      bookingId, 
      'PAYMENT_RECEIVED', 
      'Payment received successfully. Booking automatically confirmed.',
      connection
    );
  }

  /**
   * Create a log entry for a booking
   */
  async createBookingLog(bookingId, action, description, connection) {
    const logQuery = `
      INSERT INTO booking_logs (booking_id, action, description) 
      VALUES (?, ?, ?)
    `;
    await connection.execute(logQuery, [bookingId, action, description]);
  }

  /**
   * Get payment status by booking ID
   */
  async getStatus(bookingId) {
    const [rows] = await pool.execute(
      'SELECT invoice_id, external_id, status, paid_amount, invoice_url FROM payment_invoices WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1',
      [bookingId]
    );

    if (rows.length === 0) {
      throw new Error('Payment record not found for this booking');
    }

    return rows[0];
  }
}

module.exports = new PaymentService();
