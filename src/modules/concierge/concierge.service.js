const conciergeModel = require('./concierge.model');
const pool = require('../../database/connection');
const { getIO } = require('../../sockets/socket.manager');

class ConciergeService {
  async getActiveTickets() {
    return await conciergeModel.findActiveTickets();
  }

  async getTicketMessages(ticketId) {
    return await conciergeModel.getMessages(ticketId);
  }

  async sendMessage(data) {
    const payload = {
      ticket_id: data.ticket_id,
      message: data.message,
      sender_id: data.sender_id || null // null means sent by guest
    };
    
    const messageId = await conciergeModel.createMessage(payload);
    
    // Realtime broadcast to specific ticket room
    const io = getIO();
    const eventData = { 
      ...payload, 
      id: messageId,
      createdAt: new Date().toISOString()
    };
    
    io.to(`ticket_${data.ticket_id}`).emit('new_message', eventData);
    
    // Also notify all staff globally to update their sidebar/chat list
    io.to('staff').emit('new_message', eventData);
    
    return messageId;
  }

  async getOrCreateTicketForGuest(guestId) {
    // 1. Check if guest has an open ticket
    const sql = 'SELECT * FROM support_tickets WHERE guest_id = ? AND ticket_status != "closed" LIMIT 1';
    const [rows] = await pool.execute(sql, [guestId]);
    
    if (rows.length > 0) {
      return rows[0];
    }
    
    // 2. Create new ticket
    const ticketSql = 'INSERT INTO support_tickets (guest_id, ticket_status, ticket_type, subject) VALUES (?, "open", "reception", "Reception Assistance")';
    const [result] = await pool.execute(ticketSql, [guestId]);
    
    return { id: result.insertId, guest_id: guestId, ticket_status: 'open' };
  }

  async getGuestTickets(guestId) {
    const sql = `
      SELECT t.*, 
      COALESCE((SELECT message FROM support_messages WHERE ticket_id = t.id ORDER BY createdAt DESC LIMIT 1), 'New request') as last_message
      FROM support_tickets t 
      WHERE t.guest_id = ? AND t.deletedAt IS NULL
      ORDER BY t.createdAt DESC
    `;
    const [rows] = await pool.execute(sql, [guestId]);
    return rows;
  }

  async createTicket(data) {
    const { guestId, type, subject, message } = data;
    const ticketSql = 'INSERT INTO support_tickets (guest_id, ticket_status, ticket_type, subject) VALUES (?, "Open", ?, ?)';
    const [result] = await pool.execute(ticketSql, [guestId, type || 'Support', subject || 'Support Request']);
    const ticketId = result.insertId;

    if (message) {
      await this.sendMessage({
        ticket_id: ticketId,
        message: message,
        sender_id: null // From guest
      });
    }

    const [ticketRows] = await pool.execute('SELECT * FROM support_tickets WHERE id = ?', [ticketId]);
    return ticketRows[0];
  }

  async deleteMessage(messageId) {
    const [msgRows] = await pool.execute('SELECT ticket_id FROM support_messages WHERE id = ?', [messageId]);
    if (msgRows.length === 0) return false;
    const ticketId = msgRows[0].ticket_id;

    const sql = 'DELETE FROM support_messages WHERE id = ?';
    await pool.execute(sql, [messageId]);

    const io = getIO();
    io.to(`ticket_${ticketId}`).emit('delete_message', { id: Number(messageId), ticketId });
    io.to('staff').emit('delete_message', { id: Number(messageId), ticketId });

    return true;
  }

  async clearChat(ticketId) {
    const sql = 'DELETE FROM support_messages WHERE ticket_id = ?';
    await pool.execute(sql, [ticketId]);

    const io = getIO();
    io.to(`ticket_${ticketId}`).emit('clear_chat', { ticketId: Number(ticketId) });
    io.to('staff').emit('clear_chat', { ticketId: Number(ticketId) });

    return true;
  }
}

module.exports = new ConciergeService();
