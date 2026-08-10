const BaseModel = require('../../database/BaseModel');
const pool = require('../../database/connection');

class AuthModel extends BaseModel {
  constructor() {
    super('users');
  }

  async findWithRole(email) {
    const sql = `
      SELECT u.*, r.role_name, 
             COALESCE(g.loyalty_points, 0) as loyalty_points, 
             COALESCE(g.membership_type, 'regular') as membership_type,
             g.birthday, g.photo, g.allergies, g.favorite_food,
             COALESCE(g.visit_count, 0) as visit_count,
             COALESCE(g.total_spending, 0.00) as total_spending,
             COALESCE(g.average_spending, 0.00) as average_spending,
             g.preferred_payment,
             COALESCE(g.marketing_consent, 0) as marketing_consent
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      LEFT JOIN guests g ON u.email = g.email AND g.deletedAt IS NULL
      WHERE u.email = ? AND u.deletedAt IS NULL
    `;
    const [rows] = await pool.execute(sql, [email]);
    return rows[0];
  }

  async findRoleByName(roleName) {
    const sql = `SELECT id FROM roles WHERE role_name = ? AND deletedAt IS NULL LIMIT 1`;
    const [rows] = await pool.execute(sql, [roleName]);
    return rows[0] ? rows[0].id : null;
  }
}

module.exports = new AuthModel();

