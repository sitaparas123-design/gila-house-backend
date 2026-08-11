const billingModel = require('./billing.model');
const pool = require('../../database/connection');

class BillingService {
  async getAllBills() {
    return await billingModel.findWithGuestDetails();
  }

  async settleBill(id, data = {}, userId) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const bill = await billingModel.findOne('id = ?', [id]);
      if (!bill) throw new Error('Bill not found');

      const amountToSettle = data.amount ? Number(data.amount) : Number(bill.remaining_balance);
      const paymentMethod = data.paymentMethod || 'Cash';

      const updatedPaidAmount = Number(bill.paid_amount) + amountToSettle;
      const remainingBalance = Number(bill.total_charges) - updatedPaidAmount;

      await billingModel.update(id, {
        paid_amount: updatedPaidAmount,
        remaining_balance: remainingBalance,
        billing_status: remainingBalance <= 0 ? 'settled' : 'open'
      });

      await billingModel.createSettlement({
        billing_id: id,
        payment_method: paymentMethod,
        settled_amount: amountToSettle,
        settled_by: userId
      });

      await connection.commit();
      return { remainingBalance };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async addCharge(id, data = {}) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const { description, amount, type, date } = data;
      
      const sql = `
        INSERT INTO billing_charges (billing_id, description, amount, type, charge_date) 
        VALUES (?, ?, ?, ?, ?)
      `;
      await connection.execute(sql, [id, description, amount, type, date || new Date().toISOString().split('T')[0]]);

      // Update total charges and balance in guest_billing
      const updateSql = `
        UPDATE guest_billing 
        SET total_charges = total_charges + ?, 
            remaining_balance = remaining_balance + ? 
        WHERE id = ?
      `;
      await connection.execute(updateSql, [amount, amount, id]);

      await connection.commit();
      return { success: true };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async getGuestBill(reservationId) {
    const bill = await billingModel.findByReservationId(reservationId);
    if (!bill) throw new Error('Bill not found for this reservation');
    return bill;
  }
  async editBill(id, data = {}) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const bill = await billingModel.findOne('id = ?', [id]);
      if (!bill) throw new Error('Bill not found');

      const { total_charges, remaining_balance, billing_status, ...otherUpdates } = data;
      
      const updateData = { ...otherUpdates };
      if (total_charges !== undefined) {
        updateData.total_charges = Number(total_charges);
        // Recalculate remaining balance
        const paidAmount = Number(bill.paid_amount);
        updateData.remaining_balance = Math.max(0, updateData.total_charges - paidAmount);
        updateData.billing_status = updateData.remaining_balance <= 0 ? 'settled' : 'open';
      }

      await billingModel.update(id, updateData);
      
      await connection.commit();
      return { success: true };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async deleteBill(id) {
    const bill = await billingModel.findOne('id = ?', [id]);
    if (!bill) throw new Error('Bill not found');
    
    // Soft delete the bill
    await billingModel.softDelete(id);
    return { success: true };
  }
}

module.exports = new BillingService();
