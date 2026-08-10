const BaseModel = require('../../database/BaseModel');
const pool = require('../../database/connection');

class StaffModel extends BaseModel {
  constructor() {
    super('users');
  }

  async findAllStaff() {
    const sql = `
      SELECT u.id, u.full_name, u.email, u.phone, u.status, u.shift, u.rating, r.role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.role_name != 'customer' AND u.deletedAt IS NULL
    `;
    const [rows] = await pool.execute(sql);
    return rows;
  }
}

module.exports = new StaffModel();
