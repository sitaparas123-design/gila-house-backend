const pool = require('./src/database/connection');
(async () => {
  try {
    // Check if Sarah already exists
    const [existing] = await pool.query("SELECT id FROM guests WHERE full_name = 'Sarah Jenkins'");
    let guestId;
    if (existing.length > 0) {
      guestId = existing[0].id;
    } else {
      const [g] = await pool.query("INSERT INTO guests (full_name, membership_type) VALUES ('Sarah Jenkins', 'VIP')");
      guestId = g.insertId;
    }

    // Check if she has an open ticket
    const [tickets] = await pool.query("SELECT id FROM support_tickets WHERE guest_id = ? AND ticket_status != 'closed'", [guestId]);
    let ticketId;
    if (tickets.length > 0) {
      ticketId = tickets[0].id;
    } else {
      const [t] = await pool.query("INSERT INTO support_tickets (guest_id, ticket_status, priority) VALUES (?, 'open', 'high')", [guestId]);
      ticketId = t.insertId;
    }

    // Add initial message if ticket is empty
    const [msgs] = await pool.query("SELECT id FROM support_messages WHERE ticket_id = ?", [ticketId]);
    if (msgs.length === 0) {
      await pool.query("INSERT INTO support_messages (ticket_id, sender_id, message) VALUES (?, null, 'Hi, can I get extra towels in room LENA?')", [ticketId]);
    }

    console.log('Sarah Jenkins data synchronized. Ticket ID:', ticketId);
  } catch (e) {
    console.error('Error seeding Sarah:', e);
  }
  process.exit();
})();
