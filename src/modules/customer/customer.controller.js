const pool = require('../../database/connection');
const { sendSuccess, sendError } = require('../../utils/response.formatter');

class CustomerController {
  async getFavorites(req, res) {
    try {
      const customerId = req.user.id;
      const [rows] = await pool.execute(`
        SELECT f.*, mi.item_name, mi.price, mi.image, mi.description
        FROM favorites f
        JOIN menu_items mi ON f.menu_item_id = mi.id
        WHERE f.customer_id = ? AND f.deletedAt IS NULL
      `, [customerId]);
      
      return sendSuccess(res, 'Favorites fetched successfully', rows);
    } catch (err) {
      return sendError(res, err.message);
    }
  }

  async toggleFavorite(req, res) {
    try {
      const { itemId } = req.body;
      const userId = req.user.id;

      const [existing] = await pool.execute(
        'SELECT * FROM favorites WHERE customer_id = ? AND menu_item_id = ?',
        [userId, itemId]
      );

      if (existing.length > 0) {
        await pool.execute(
          'DELETE FROM favorites WHERE customer_id = ? AND menu_item_id = ?',
          [userId, itemId]
        );
        return sendSuccess(res, 'Removed from favorites');
      } else {
        await pool.execute(
          'INSERT INTO favorites (customer_id, menu_item_id) VALUES (?, ?)',
          [userId, itemId]
        );
        return sendSuccess(res, 'Added to favorites');
      }
    } catch (err) {
      return sendError(res, err.message);
    }
  }
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const [rows] = await pool.execute(
        `SELECT u.id, u.full_name as name, u.email, u.phone, u.role_id, 
                COALESCE(g.loyalty_points, 0) as loyalty_points, 
                COALESCE(g.membership_type, 'regular') as membership_type,
                g.birthday, COALESCE(g.photo, u.avatar) as photo, g.allergies, g.favorite_food,
                COALESCE(g.visit_count, 0) as visit_count,
                COALESCE(g.total_spending, 0.00) as total_spending,
                COALESCE(g.average_spending, 0.00) as average_spending,
                g.preferred_payment,
                COALESCE(g.marketing_consent, 0) as marketing_consent
         FROM users u
         LEFT JOIN guests g ON u.email = g.email AND g.deletedAt IS NULL
         WHERE u.id = ? AND u.deletedAt IS NULL`,
        [userId]
      );
      
      if (rows.length === 0) {
        return sendError(res, 'User profile not found', 404);
      }
      return sendSuccess(res, 'Profile fetched successfully', rows[0]);
    } catch (err) {
      return sendError(res, err.message);
    }
  }

  async updateProfile(req, res) {
    try {
      const { 
        name, 
        email, 
        phone, 
        birthday, 
        photo, 
        allergies, 
        favorite_food, 
        preferred_payment, 
        marketing_consent 
      } = req.body;
      const userId = req.user.id;

      // 1. Get current email before updating users table
      const [currentUser] = await pool.execute('SELECT email FROM users WHERE id = ?', [userId]);
      const currentEmail = currentUser[0]?.email;

      // 2. Update users table. Note: we map 'name' from frontend to 'full_name' in DB
      await pool.execute(
        'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?',
        [name, email, phone, userId]
      );

      // 3. Update/Insert guests table
      if (currentEmail) {
        const [existingGuest] = await pool.execute(
          'SELECT id FROM guests WHERE email = ? AND deletedAt IS NULL',
          [currentEmail]
        );
        
        const birthdayVal = birthday ? birthday.split('T')[0] : null;
        const consentVal = marketing_consent ? 1 : 0;
        
        if (existingGuest.length > 0) {
          await pool.execute(
            `UPDATE guests 
             SET full_name = ?, email = ?, phone = ?, birthday = ?, photo = ?, allergies = ?, 
                 favorite_food = ?, preferred_payment = ?, marketing_consent = ?
             WHERE id = ?`,
            [
              name, 
              email, 
              phone, 
              birthdayVal, 
              photo || null, 
              allergies || null, 
              favorite_food || null, 
              preferred_payment || null, 
              consentVal, 
              existingGuest[0].id
            ]
          );
        } else {
          await pool.execute(
            `INSERT INTO guests (full_name, email, phone, birthday, photo, allergies, favorite_food, preferred_payment, marketing_consent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              name, 
              email, 
              phone, 
              birthdayVal, 
              photo || null, 
              allergies || null, 
              favorite_food || null, 
              preferred_payment || null, 
              consentVal
            ]
          );
        }
      }

      // Fetch updated user data with all fields
      const [updatedUser] = await pool.execute(
        `SELECT u.id, u.full_name as name, u.email, u.phone, u.role_id, 
                COALESCE(g.loyalty_points, 0) as loyalty_points, 
                COALESCE(g.membership_type, 'regular') as membership_type,
                g.birthday, COALESCE(g.photo, u.avatar) as photo, g.allergies, g.favorite_food,
                COALESCE(g.visit_count, 0) as visit_count,
                COALESCE(g.total_spending, 0.00) as total_spending,
                COALESCE(g.average_spending, 0.00) as average_spending,
                g.preferred_payment,
                COALESCE(g.marketing_consent, 0) as marketing_consent
         FROM users u
         LEFT JOIN guests g ON u.email = g.email AND g.deletedAt IS NULL
         WHERE u.id = ?`,
        [userId]
      );

      return sendSuccess(res, 'Profile updated successfully', updatedUser[0]);
    } catch (err) {
      return sendError(res, err.message);
    }
  }

  async redeemReward(req, res) {
    try {
      const { rewardTitle, pointsCost } = req.body;
      const userId = req.user.id;
      const userEmail = req.user.email;

      if (!rewardTitle || !pointsCost) {
        return sendError(res, 'Reward title and points cost are required', 400);
      }

      // Get user's guest profile to check points
      const [guests] = await pool.execute(
        'SELECT id, loyalty_points FROM guests WHERE email = ? AND deletedAt IS NULL',
        [userEmail]
      );

      if (guests.length === 0) {
        return sendError(res, 'Guest profile not found', 404);
      }

      const guest = guests[0];
      const currentPoints = guest.loyalty_points || 0;

      if (currentPoints < pointsCost) {
        return sendError(res, 'Insufficient loyalty points', 400);
      }

      // Deduct points
      const newPoints = currentPoints - pointsCost;
      await pool.execute(
        'UPDATE guests SET loyalty_points = ? WHERE id = ?',
        [newPoints, guest.id]
      );

      // Generate a coupon code
      const titleAbbr = rewardTitle.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase();
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const couponCode = `RW-${titleAbbr}-${randomCode}`;

      // Insert coupon code into the coupons table
      let discountType = 'percentage';
      let discountValue = 100.00; // default for "Free item" is 100% off
      let minOrderAmount = 0.00;
      let maxDiscountAmount = null;

      if (rewardTitle.toLowerCase().includes('voucher')) {
        discountType = 'flat';
        discountValue = 50.00; // e.g. Rp 50.000 flat discount
      }

      await pool.execute(
        `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [couponCode, discountType, discountValue, minOrderAmount, maxDiscountAmount]
      );

      return sendSuccess(res, 'Reward redeemed successfully', {
        couponCode,
        newPoints,
        rewardTitle
      });

    } catch (err) {
      return sendError(res, err.message);
    }
  }
}

module.exports = new CustomerController();
