const billingService = require('./billing.service');

class BillingController {
  async getAllBills(req, res) {
    try {
      const bills = await billingService.getAllBills();
      res.json({
        success: true,
        message: 'Bills fetched successfully',
        data: bills
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async settleBill(req, res) {
    try {
      const result = await billingService.settleBill(req.params.id, req.body, req.user.id);
      res.json({
        success: true,
        message: 'Bill settled successfully',
        data: result
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async addCharge(req, res) {
    try {
      const result = await billingService.addCharge(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Charge added successfully',
        data: result
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async getGuestBill(req, res) {
    try {
      const { reservationId } = req.query;
      const bill = await billingService.getGuestBill(reservationId);
      res.json({
        success: true,
        message: 'Bill fetched successfully',
        data: bill
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new BillingController();
