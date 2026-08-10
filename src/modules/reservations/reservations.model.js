const BaseModel = require('../../database/BaseModel');
const pool = require('../../database/connection');

class ReservationsModel extends BaseModel {
  constructor() {
    super('reservations');
  }

  async findWithGuestDetails(filters = {}) {
    let sql = `
      SELECT 
        r.*, 
        r.booking_date as date, 
        r.booking_time as time, 
        r.reservation_status as status, 
        r.booking_type as type, 
        r.guests_count as guests,
        r.special_notes as notes,
        g.full_name,
        g.full_name as guestName, 
        g.phone, 
        g.email,
        COALESCE(rt.table_code, rm.room_name, 'N/A') as targetId,
        COALESCE(rt.table_code, rm.room_name, 'N/A') as location
      FROM reservations r 
      LEFT JOIN guests g ON r.guest_id = g.id 
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id AND r.booking_type = 'table'
      LEFT JOIN rooms rm ON r.room_id = rm.id AND r.booking_type = 'room'
      WHERE r.deletedAt IS NULL
    `;
    const params = [];

    if (filters.status) {
      sql += ` AND r.reservation_status = ?`;
      params.push(filters.status);
    }

    if (filters.date) {
      sql += ` AND r.booking_date = ?`;
      params.push(filters.date);
    }

    if (filters.customerEmail || filters.customerName) {
      if (filters.customerEmail && filters.customerName) {
        sql += ` AND (g.email = ? OR g.full_name = ?)`;
        params.push(filters.customerEmail, filters.customerName);
      } else if (filters.customerEmail) {
        sql += ` AND g.email = ?`;
        params.push(filters.customerEmail);
      } else if (filters.customerName) {
        sql += ` AND g.full_name = ?`;
        params.push(filters.customerName);
      }
    }

    sql += ` ORDER BY r.id DESC`;

    const [rows] = await pool.execute(sql, params);
    
    // Capitalize status and type for frontend compatibility (e.g., 'checked_in' -> 'Checked In')
    return rows.map(row => ({
      ...row,
      status: row.status ? row.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : row.status,
      type: row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1) : row.type
    }));
  }
}

module.exports = new ReservationsModel();
