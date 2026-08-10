const BaseModel = require('../../database/BaseModel');
const pool = require('../../database/connection');

class ConciergeModel extends BaseModel {
  constructor() {
    super('support_tickets');
  }

  async findActiveTickets() {
    const sql = `
      SELECT t.*, u.full_name as guest_name, u.phone as guest_phone,
      COALESCE((SELECT message FROM support_messages WHERE ticket_id = t.id ORDER BY createdAt DESC LIMIT 1), 'New request') as last_message,
      COALESCE((SELECT createdAt FROM support_messages WHERE ticket_id = t.id ORDER BY createdAt DESC LIMIT 1), t.createdAt) as last_message_at
      FROM support_tickets t 
      LEFT JOIN users u ON t.guest_id = u.id 
      WHERE t.ticket_status != "closed" AND t.deletedAt IS NULL
      ORDER BY last_message_at DESC, t.createdAt DESC
    `;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  async getMessages(ticketId) {
    const sql = `
      SELECT m.*, u.full_name as sender_name 
      FROM support_messages m 
      LEFT JOIN users u ON m.sender_id = u.id 
      WHERE m.ticket_id = ? AND m.deletedAt IS NULL 
      ORDER BY m.createdAt ASC
    `;
    const [rows] = await pool.execute(sql, [ticketId]);
    return rows;
  }

  async createMessage(data) {
    const { ticket_id, sender_id, message } = data;
    const sql = `INSERT INTO support_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)`;
    const [result] = await pool.execute(sql, [ticket_id, sender_id, message]);
    return result.insertId;
  }
}

module.exports = new ConciergeModel();
