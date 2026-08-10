const reservationsService = require('./reservations.service');

class ReservationsController {
  async getAllReservations(req, res) {
    try {
      let { status, date, customerEmail, customerName } = req.query;
      
      // Enforce data privacy: Customers can ONLY see their own reservations
      const userRole = (req.user?.role_name || '').toLowerCase().trim();
      if (userRole === 'customer') {
        customerEmail = req.user.email;
        customerName = req.user.full_name;
      }

      const reservations = await reservationsService.getAllReservations({ status, date, customerEmail, customerName });
      res.json({
        success: true,
        message: 'Reservations fetched successfully',
        data: reservations
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async createReservation(req, res) {
    try {
      const result = await reservationsService.createReservation(req.body);
      res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: { id: result.reservationId, guestId: result.guestId }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      await reservationsService.updateStatus(req.params.id, status);
      res.json({
        success: true,
        message: 'Reservation status updated successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async deleteReservation(req, res) {
    try {
      await reservationsService.deleteReservation(req.params.id);
      res.json({
        success: true,
        message: 'Reservation deleted successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new ReservationsController();
