const BaseModel = require('../../database/BaseModel');
const pool = require('../../database/connection');

class TasksModel extends BaseModel {
  constructor() {
    super('tasks');
  }

  async findWithStaff() {
    const sql = `
      SELECT t.*, u.full_name as assigned_staff 
      FROM tasks t 
      LEFT JOIN users u ON t.assigned_to = u.id 
      WHERE t.deletedAt IS NULL
    `;
    const [rows] = await pool.execute(sql);
    return rows;
  }
}

module.exports = new TasksModel();
