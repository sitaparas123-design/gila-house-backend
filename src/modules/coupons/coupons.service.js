const pool = require('../../database/connection');

class CouponsService {
  async getAllCoupons() {
    const [rows] = await pool.execute('SELECT * FROM coupons ORDER BY created_at DESC');
    return rows;
  }

  async getCouponByCode(code) {
    const [rows] = await pool.execute('SELECT * FROM coupons WHERE code = ?', [code]);
    return rows[0];
  }

  async createCoupon(data) {
    const { code, discount_type, discount_value, min_order_amount, max_discount_amount } = data;
    const [result] = await pool.execute(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [code, discount_type, discount_value, min_order_amount || 0, max_discount_amount || null]
    );
    return result.insertId;
  }

  async updateCoupon(id, data) {
    const { is_active } = data;
    await pool.execute(
      'UPDATE coupons SET is_active = ? WHERE id = ?',
      [is_active, id]
    );
  }

  async deleteCoupon(id) {
    await pool.execute('DELETE FROM coupons WHERE id = ?', [id]);
  }

  async validateCoupon(code, cartTotal, userId = null) {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    if (!coupon.is_active) {
      throw new Error('This coupon is no longer active');
    }

    if (coupon.code === 'FREEDESSERT' && userId) {
      const [orders] = await pool.execute(
        "SELECT id FROM orders WHERE user_id = ? AND order_status != 'cancelled'",
        [userId]
      );
      if (orders.length > 0) {
        throw new Error('This coupon is only valid for your first order!');
      }
    }

    if (cartTotal < parseFloat(coupon.min_order_amount)) {
      throw new Error(`Minimum order amount for this coupon is ₹${coupon.min_order_amount}`);
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'flat') {
      discountAmount = parseFloat(coupon.discount_value);
    } else if (coupon.discount_type === 'percentage') {
      discountAmount = cartTotal * (parseFloat(coupon.discount_value) / 100);
      if (coupon.max_discount_amount && discountAmount > parseFloat(coupon.max_discount_amount)) {
        discountAmount = parseFloat(coupon.max_discount_amount);
      }
    }

    // Discount cannot exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    return {
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      message: 'Coupon applied successfully'
    };
  }
}

module.exports = new CouponsService();
