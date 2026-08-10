const conciergeService = require('./concierge.service');

class ConciergeController {
  async getTickets(req, res) {
    try {
      let tickets;
      const role = (req.user.role_name || req.user.role || '').toLowerCase();
      if (role === 'customer' || role === 'guest') {
         tickets = await conciergeService.getGuestTickets(req.user.id);
      } else {
         tickets = await conciergeService.getActiveTickets();
      }
      res.json({
        success: true,
        message: 'Tickets fetched successfully',
        data: tickets
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async createTicket(req, res) {
    try {
      const guestId = req.user.id;
      const { type, subject, message } = req.body;
      
      const ticket = await conciergeService.createTicket({
        guestId, type, subject, message
      });

      res.status(201).json({
        success: true,
        data: ticket
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getMessages(req, res) {
    try {
      const messages = await conciergeService.getTicketMessages(req.params.id);
      res.json({
        success: true,
        message: 'Messages fetched successfully',
        data: messages
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async sendMessage(req, res) {
    try {
      const { ticket_id, message } = req.body;
      const messageId = await conciergeService.sendMessage({
        ticket_id,
        message,
        sender_id: req.user.id
      });
      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: { id: messageId }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async getGuestTicket(req, res) {
    try {
      const ticket = await conciergeService.getOrCreateTicketForGuest(req.params.guestId);
      res.json({
        success: true,
        data: ticket
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async sendGuestMessage(req, res) {
    try {
      const { ticket_id, message, guest_id } = req.body;
      const messageId = await conciergeService.sendMessage({
        ticket_id,
        message,
        guest_id // Pass guest_id instead of sender_id
      });
      res.status(201).json({
        success: true,
        data: { id: messageId }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const success = await conciergeService.deleteMessage(id);
      res.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async clearChat(req, res) {
    try {
      const { id } = req.params;
      await conciergeService.clearChat(id);
      res.json({
        success: true,
        message: 'Chat cleared successfully'
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new ConciergeController();
