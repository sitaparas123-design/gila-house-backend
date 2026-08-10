require('dotenv').config();
const { Xendit } = require('xendit-node');

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

async function testQr() {
  try {
    const response = await xenditClient.PaymentRequest.createPaymentRequest({
      data: {
        amount: 10000,
        currency: 'IDR', // Add currency if required by your Xendit account
        paymentMethod: {
          type: 'QR_CODE',
          reusability: 'ONE_TIME_USE',
          qrCode: {
             channelCode: 'QRIS'
          }
        }
      }
    });
    console.log("SUCCESS:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("ERROR:");
    console.error(error);
  }
}

testQr();
