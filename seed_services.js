const pool = require('./src/database/connection');
(async () => {
  try {
    // Seed Services
    const [existingServices] = await pool.query("SELECT id FROM services WHERE service_name = 'City Tour'");
    let serviceId;
    if (existingServices.length === 0) {
      const [s] = await pool.query("INSERT INTO services (service_name, service_type, description, price_per_person) VALUES ('City Tour', 'excursion', 'Full day city exploration', 1500)");
      serviceId = s.insertId;
    } else {
      serviceId = existingServices[0].id;
    }

    // Seed a booking for Sarah Jenkins (Guest ID 2 from previous seed? No, let's check)
    const [guests] = await pool.query("SELECT id FROM guests WHERE full_name = 'Sarah Jenkins'");
    if (guests.length > 0) {
      const guestId = guests[0].id;
      const [existingBookings] = await pool.query("SELECT id FROM service_bookings WHERE guest_id = ? AND service_id = ?", [guestId, serviceId]);
      if (existingBookings.length === 0) {
        await pool.query("INSERT INTO service_bookings (service_id, guest_id, booking_date, booking_time, total_guests, total_amount, booking_status) VALUES (?, ?, CURDATE(), '10:00:00', 2, 3000, 'pending')", [serviceId, guestId]);
        console.log('Service booking seeded for Sarah');
      }
    }

    console.log('Services synchronization complete');
  } catch (e) {
    console.error('Error seeding services:', e);
  }
  process.exit();
})();
