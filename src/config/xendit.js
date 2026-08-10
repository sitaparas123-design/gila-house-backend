const { Xendit } = require('xendit-node');

if (!process.env.XENDIT_SECRET_KEY) {
  console.warn('WARNING: XENDIT_SECRET_KEY is missing in environment variables');
}

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || 'dummy_key',
});

module.exports = {
  xenditClient,
  webhookToken: process.env.XENDIT_WEBHOOK_TOKEN
};
