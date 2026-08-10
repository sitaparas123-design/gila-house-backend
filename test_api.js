const invoiceData = {
  bookingId: "B-TEST-" + Math.floor(Math.random() * 1000),
  guestName: "Kiaan",
  email: "test@example.com",
  phone: "1234567890",
  amount: 5000,
  description: "Room Booking Test"
};

console.log("Sending request to generate invoice...");

fetch('http://127.0.0.1:5000/api/payment/create-invoice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(invoiceData)
})
.then(res => res.json())
.then(data => {
  console.log("\n--- SERVER RESPONSE ---");
  console.log(data);
  
  if (data.invoiceUrl) {
    console.log("\n✅ SUCCESS! Payment link generated successfully.");
    console.log("👉 URL (Ctrl+Click to open in browser):");
    console.log(data.invoiceUrl);
  } else {
    console.log("\n❌ Failed to generate payment link. Check the server response above.");
  }
})
.catch(err => {
  console.error("Error connecting to server:", err.message);
  console.log("Make sure your backend server is running on port 5000.");
});
