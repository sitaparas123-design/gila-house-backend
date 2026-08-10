const staffModel = require('./staff.model');
const pool = require('../../database/connection');
const bcrypt = require('bcryptjs');

class StaffService {
  async getAllStaff() {
    return await staffModel.findAllStaff();
  }

  async createStaff(data) {
    const { role_name, ...staffData } = data;
    
    // Resolve role_id from role_name
    if (role_name) {
      const [roleRows] = await pool.execute(
        'SELECT id FROM roles WHERE role_name = ?',
        [role_name.toLowerCase()]
      );
      if (roleRows.length > 0) {
        staffData.role_id = roleRows[0].id;
      }
    }

    if (staffData.password) {
      staffData.password = await bcrypt.hash(staffData.password, 10);
    } else {
      // Default password if none provided
      staffData.password = await bcrypt.hash('Staff@123', 10);
    }

    return await staffModel.create(staffData);
  }

  async updateStaff(id, data) {
    const { role_name, ...staffData } = data;

    // Resolve role_id if role_name is provided
    if (role_name) {
      const [roleRows] = await pool.execute(
        'SELECT id FROM roles WHERE role_name = ?',
        [role_name.toLowerCase()]
      );
      if (roleRows.length > 0) {
        staffData.role_id = roleRows[0].id;
      }
    }

    if (staffData.password) {
      staffData.password = await bcrypt.hash(staffData.password, 10);
    }
    
    return await staffModel.update(id, staffData);
  }

  async deleteStaff(id) {
    return await staffModel.delete(id);
  }
}

module.exports = new StaffService();
