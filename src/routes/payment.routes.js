const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyXenditWebhook } = require('../middleware/webhook.middleware');

// Health check endpoint: GET /api/payment/test
router.get('/test', paymentController.testPayment);

// Create Invoice endpoint: POST /api/payment/create-invoice
router.post('/create-invoice', paymentController.createInvoice);

// Create QR Code endpoint: POST /api/payment/create-qr
router.post('/create-qr', paymentController.createQrCode);

// Webhook endpoint: POST /api/payment/webhook
router.post('/webhook', verifyXenditWebhook, paymentController.handleWebhook);

// Get Payment Status endpoint: GET /api/payment/status/:bookingId
router.get('/status/:bookingId', paymentController.getPaymentStatus);

module.exports = router;
