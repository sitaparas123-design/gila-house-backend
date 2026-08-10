const xenditConfig = require('../config/xendit');

const verifyXenditWebhook = (req, res, next) => {
  try {
    const webhookToken = req.headers['x-callback-token'];

    if (!webhookToken) {
      return res.status(401).json({
        success: false,
        message: 'Webhook token is missing'
      });
    }

    if (webhookToken !== xenditConfig.webhookToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid webhook token'
      });
    }

    next();
  } catch (error) {
    console.error('Webhook Verification Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during webhook verification'
    });
  }
};

module.exports = {
  verifyXenditWebhook
};
