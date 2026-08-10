const BaseModel = require('../../database/BaseModel');
const pool = require('../../database/connection');

class BillingModel extends BaseModel {
  constructor() {
    super('guest_billing');
  }

  async findWithGuestDetails() {
    const sql = `
      SELECT b.*, g.full_name as guestName, g.phone, 
             COALESCE(rm.room_name, rm.room_code, 'N/A') as roomName
      FROM guest_billing b 
      JOIN guests g ON b.guest_id = g.id 
      LEFT JOIN room_bookings rb ON b.reservation_id = rb.reservation_id
      LEFT JOIN rooms rm ON rb.room_id = rm.id
      WHERE b.deletedAt IS NULL
      ORDER BY b.id DESC
    `;
    const [rows] = await pool.execute(sql);
    
    // Fetch items for each bill
    const billsWithItems = await Promise.all(rows.map(async (row) => {
      const [charges] = await pool.execute(
        'SELECT id, description, amount, type, DATE_FORMAT(charge_date, "%Y-%m-%d") as date FROM billing_charges WHERE billing_id = ?',
        [row.id]
      );
      
      return {
        ...row,
        guestName: row.guestName,
        roomName: row.roomName,
        total: parseFloat(row.total_charges),
        status: row.billing_status === 'settled' ? 'Settled' : 'Open',
        items: charges.map(c => ({
          ...c,
          amount: parseFloat(c.amount)
        }))
      };
    }));

    return billsWithItems;
  }

  async createSettlement(data) {
    const { billing_id, payment_method, settled_amount, settled_by } = data;
    const sql = `
      INSERT INTO settlements (billing_id, payment_method, settled_amount, settled_by) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [billing_id, payment_method, settled_amount, settled_by]);
    return result.insertId;
  }

  async findByReservationId(reservationId) {
    const sql = `
      SELECT b.*, g.full_name as guestName, g.phone, rb.check_in, rb.check_out,
             COALESCE(rm.room_name, rm.room_code, 'N/A') as roomName
      FROM guest_billing b 
      JOIN guests g ON b.guest_id = g.id 
      LEFT JOIN room_bookings rb ON b.reservation_id = rb.reservation_id
      LEFT JOIN rooms rm ON rb.room_id = rm.id
      WHERE b.reservation_id = ? AND b.deletedAt IS NULL
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [reservationId]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    const [charges] = await pool.execute(
      'SELECT id, description, amount, type, DATE_FORMAT(charge_date, "%Y-%m-%d") as date FROM billing_charges WHERE billing_id = ?',
      [row.id]
    );

    return {
      ...row,
      guestName: row.guestName,
      roomName: row.roomName,
      checkIn: row.check_in,
      checkOut: row.check_out,
      total: parseFloat(row.total_charges),
      status: row.billing_status === 'settled' ? 'Settled' : 'Open',
      items: charges.map(c => ({
        ...c,
        amount: parseFloat(c.amount)
      }))
    };
  }
}

module.exports = new BillingModel();
