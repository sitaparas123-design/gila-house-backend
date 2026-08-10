const http = require('http');

async function testWebhook() {
  console.log("Simulating Xendit Webhook (Payment Success)...");
  
  const payload = JSON.stringify({
    id: "6a1ff4e7b9beb1ef7b1a6e92", 
    external_id: "B-TEST-675_1780479207",
    status: "PAID",
    paid_amount: 5000,
    paid_at: new Date().toISOString(),
    payment_method: "MANDIRI",
  });

  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/payment/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'x-callback-token': 'your_webhook_token'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log("\n--- WEBHOOK SERVER RESPONSE ---");
      console.log(data);
      console.log("\n✅ Webhook processed successfully!");
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(payload);
  req.end();
}

testWebhook();
