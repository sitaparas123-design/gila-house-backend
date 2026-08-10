const BaseModel = require('../../database/BaseModel');
const pool = require('../../database/connection');

class RoomsModel extends BaseModel {
  constructor() {
    super('rooms');
  }

  async findAllWithGuestInfo() {
    const sql = `
      SELECT 
        r.*,
        r.room_status as status,
        (
          SELECT g.full_name 
          FROM room_bookings rb
          JOIN reservations res ON rb.reservation_id = res.id
          JOIN guests g ON res.guest_id = g.id
          WHERE rb.room_id = r.id AND r.room_status = 'occupied'
          ORDER BY rb.createdAt DESC
          LIMIT 1
        ) as assignedGuest,
        (
          SELECT g.full_name 
          FROM room_bookings rb
          JOIN reservations res ON rb.reservation_id = res.id
          JOIN guests g ON res.guest_id = g.id
          WHERE rb.room_id = r.id AND r.room_status = 'occupied'
          ORDER BY rb.createdAt DESC
          LIMIT 1
        ) as assigned_guest,
        (
          SELECT rb.total_guests 
          FROM room_bookings rb
          WHERE rb.room_id = r.id AND r.room_status = 'occupied'
          ORDER BY rb.createdAt DESC
          LIMIT 1
        ) as guests_count
      FROM rooms r
      WHERE r.deletedAt IS NULL
    `;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  async findAvailable() {
    const sql = `SELECT * FROM rooms WHERE room_status = "available" AND deletedAt IS NULL`;
    const [rows] = await pool.execute(sql);
    return rows;
  }
}

module.exports = new RoomsModel();
