const pool = require('./connection');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findAll(where = '', params = []) {
    let sql = `SELECT * FROM ${this.tableName} WHERE deletedAt IS NULL`;
    if (where) sql += ` AND ${where}`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async findOne(where, params = []) {
    let sql = `SELECT * FROM ${this.tableName} WHERE deletedAt IS NULL AND ${where} LIMIT 1`;
    const [rows] = await pool.execute(sql, params);
    return rows[0];
  }

  async findById(id) {
    return this.findOne('id = ?', [id]);
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data).map(v => v === undefined ? null : v);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.execute(sql, values);
    return result.insertId;
  }

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data).map(v => v === undefined ? null : v);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    const [result] = await pool.execute(sql, [...values, id]);
    return result.affectedRows;
  }

  async softDelete(id) {
    const sql = `UPDATE ${this.tableName} SET deletedAt = NOW() WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows;
  }

  async delete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows;
  }
}

module.exports = BaseModel;
