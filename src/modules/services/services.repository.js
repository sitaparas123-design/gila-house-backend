const pool = require('../../database/connection');

class ServiceRepository {
  async getAllServices() {
    const [rows] = await pool.query('SELECT * FROM services WHERE deletedAt IS NULL');
    return rows;
  }

  async getAllBookings() {
    const sql = `
      SELECT b.*, s.service_name, s.service_type, 
             COALESCE(b.customer_name, g.full_name) as guest_name,
             COALESCE(b.customer_email, g.email) as guest_email,
             COALESCE(b.customer_phone, g.phone) as guest_phone
      FROM service_bookings b
      JOIN services s ON b.service_id = s.id
      LEFT JOIN guests g ON b.guest_id = g.id
      WHERE b.deletedAt IS NULL
      ORDER BY b.createdAt DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  }

  async updateBookingStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE service_bookings SET booking_status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  async createService(data) {
    const { service_name, service_type, description, price_per_person, image } = data;
    const [result] = await pool.query(
      'INSERT INTO services (service_name, service_type, description, price_per_person, image) VALUES (?, ?, ?, ?, ?)',
      [service_name, service_type, description, price_per_person, image || null]
    );
    return result.insertId;
  }

  async createBooking(data) {
    const { 
      service_id, guest_id, customer_name, customer_email, customer_phone, 
      booking_date, booking_time, total_guests, total_amount, notes 
    } = data;
    
    const [result] = await pool.query(
      `INSERT INTO service_bookings 
      (service_id, guest_id, customer_name, customer_email, customer_phone, 
       booking_date, booking_time, total_guests, total_amount, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        service_id, guest_id || null, customer_name, customer_email, customer_phone, 
        booking_date, booking_time, total_guests || 1, total_amount, notes
      ]
    );
    return result.insertId;
  }
}

module.exports = new ServiceRepository();
