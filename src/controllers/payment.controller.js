const paymentService = require('../services/payment.service');

class PaymentController {
  /**
   * Health check endpoint handler
   */
  async testPayment(req, res) {
    try {
      const result = await paymentService.testConnection();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Payment Test Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while testing payment module',
        error: error.message
      });
    }
  }

  /**
   * Create Invoice endpoint handler
   */
  async createInvoice(req, res) {
    try {
      const { bookingId, guestName, email, phone, amount, description, paymentMethods } = req.body;

      // Basic Validation
      if (!bookingId) return res.status(400).json({ success: false, message: 'bookingId is required' });
      if (!guestName) return res.status(400).json({ success: false, message: 'guestName is required' });
      if (!email) return res.status(400).json({ success: false, message: 'email is required' });
      if (amount === undefined || amount <= 0) return res.status(400).json({ success: false, message: 'amount must be greater than 0' });

      // Call Service
      const result = await paymentService.createInvoice({
        bookingId,
        guestName,
        email,
        phone,
        amount: Math.round(amount),
        description,
        paymentMethods
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Create Invoice Controller Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to create invoice',
        error: error.message
      });
    }
  }

  /**
   * Create QR Code endpoint handler
   */
  async createQrCode(req, res) {
    try {
      const { bookingId, amount, description } = req.body;

      if (!bookingId) return res.status(400).json({ success: false, message: 'bookingId is required' });
      if (amount === undefined || amount <= 0) return res.status(400).json({ success: false, message: 'amount must be greater than 0' });

      const result = await paymentService.createQrCode({
        bookingId,
        amount: Math.round(amount),
        description
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Create QR Code Controller Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to create QR code',
        error: error.message
      });
    }
  }

  /**
   * Handle Webhook endpoint
   */
  async handleWebhook(req, res) {
    try {
      await paymentService.handleWebhook(req.body);
      
      return res.status(200).json({ 
        success: true,
        message: 'Booking confirmed successfully' 
      });
    } catch (error) {
      console.error('Webhook Controller Error:', error.message);
      // Still return 200 to prevent Xendit from retrying continuously on known errors
      return res.status(500).json({
        success: false,
        message: 'Internal server error while processing webhook'
      });
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(req, res) {
    try {
      const { bookingId } = req.params;
      
      if (!bookingId) {
        return res.status(400).json({ success: false, message: 'bookingId is required' });
      }

      const status = await paymentService.getStatus(bookingId);
      return res.status(200).json({ success: true, data: status });
    } catch (error) {
      console.error('Get Payment Status Error:', error.message);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PaymentController();
