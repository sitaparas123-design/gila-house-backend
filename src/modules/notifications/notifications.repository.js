const pool = require('../../database/connection');

class NotificationRepository {
  async getAllNotifications(filters = {}) {
    let sql = 'SELECT * FROM notifications WHERE deletedAt IS NULL';
    const params = [];

    if (filters.userId && filters.role) {
      if (filters.role !== 'CUSTOMER') {
        sql += ' AND (user_id = ? OR targetRole = ? OR targetRole = "ALL" OR targetRole = "STAFF")';
      } else {
        sql += ' AND (user_id = ? OR targetRole = ? OR targetRole = "ALL")';
      }
      params.push(filters.userId, filters.role);
    } else if (filters.userId) {
      sql += ' AND (user_id = ? OR targetRole = "ALL" OR targetRole = "STAFF")';
      params.push(filters.userId);
    } else if (filters.role) {
      if (filters.role !== 'CUSTOMER') {
        sql += ' AND (targetRole = ? OR targetRole = "ALL" OR targetRole = "STAFF")';
      } else {
        sql += ' AND (targetRole = ? OR targetRole = "ALL")';
      }
      params.push(filters.role);
    }

    sql += ' ORDER BY createdAt DESC LIMIT 50';

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async getUnreadCount(filters = {}) {
    let sql = 'SELECT COUNT(*) as count FROM notifications WHERE deletedAt IS NULL AND is_read = 0';
    const params = [];

    if (filters.userId && filters.role) {
      if (filters.role !== 'CUSTOMER') {
        sql += ' AND (user_id = ? OR targetRole = ? OR targetRole = "ALL" OR targetRole = "STAFF")';
      } else {
        sql += ' AND (user_id = ? OR targetRole = ? OR targetRole = "ALL")';
      }
      params.push(filters.userId, filters.role);
    } else if (filters.userId) {
      sql += ' AND (user_id = ? OR targetRole = "ALL" OR targetRole = "STAFF")';
      params.push(filters.userId);
    } else if (filters.role) {
      if (filters.role !== 'CUSTOMER') {
        sql += ' AND (targetRole = ? OR targetRole = "ALL" OR targetRole = "STAFF")';
      } else {
        sql += ' AND (targetRole = ? OR targetRole = "ALL")';
      }
      params.push(filters.role);
    }

    const [rows] = await pool.query(sql, params);
    return rows[0].count;
  }

  async createNotification(data) {
    const { user_id, notification_type, message, targetRole } = data;
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, notification_type, message, targetRole) VALUES (?, ?, ?, ?)',
      [user_id || null, notification_type || 'system', message, targetRole || 'ALL']
    );
    return result.insertId;
  }

  async markAsRead(id) {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    return true;
  }

  async markAllAsRead(filters = {}) {
    let sql = 'UPDATE notifications SET is_read = 1 WHERE deletedAt IS NULL';
    const params = [];

    if (filters.userId && filters.role) {
      if (filters.role !== 'CUSTOMER') {
        sql += ' AND (user_id = ? OR targetRole = ? OR targetRole = "ALL" OR targetRole = "STAFF")';
      } else {
        sql += ' AND (user_id = ? OR targetRole = ? OR targetRole = "ALL")';
      }
      params.push(filters.userId, filters.role);
    } else if (filters.userId) {
      sql += ' AND (user_id = ? OR targetRole = "ALL" OR targetRole = "STAFF")';
      params.push(filters.userId);
    } else if (filters.role) {
      if (filters.role !== 'CUSTOMER') {
        sql += ' AND (targetRole = ? OR targetRole = "ALL" OR targetRole = "STAFF")';
      } else {
        sql += ' AND (targetRole = ? OR targetRole = "ALL")';
      }
      params.push(filters.role);
    }

    await pool.query(sql, params);
    return true;
  }

  async deleteNotification(id) {
    await pool.query('UPDATE notifications SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new NotificationRepository();
