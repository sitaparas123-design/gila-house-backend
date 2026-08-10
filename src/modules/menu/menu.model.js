const BaseModel = require('../../database/BaseModel');
const pool = require('../../database/connection');

class MenuModel extends BaseModel {
  constructor() {
    super('menu_items');
  }

  async findWithCategory(filters = {}) {
    let sql = `
      SELECT m.*, m.availability as available, m.availability as status, c.category_name 
      FROM menu_items m 
      LEFT JOIN menu_categories c ON m.category_id = c.id 
      WHERE m.deletedAt IS NULL
    `;
    const params = [];

    if (filters.category) {
      sql += ` AND c.category_name = ?`;
      params.push(filters.category);
    }

    if (filters.search) {
      sql += ` AND (m.item_name LIKE ? OR m.description LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.popular) {
      sql += ` AND m.popular = TRUE`;
    }

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async create(data) {
    const { name, item_name, category, category_id, price, image, description, available } = data;
    
    // 1. Resolve Category ID
    let categoryId = category_id || null;
    
    if (!categoryId && category) {
      // Clean up category name (remove "All Items" if it was sent by mistake)
      const cleanCategory = category === 'All Items' ? 'Bar' : category;
      
      const [catRows] = await pool.execute(
        'SELECT id FROM menu_categories WHERE category_name = ? AND deletedAt IS NULL',
        [cleanCategory]
      );
      
      if (catRows.length > 0) {
        categoryId = catRows[0].id;
      } else {
        // Create new category if it doesn't exist
        const [result] = await pool.execute(
          'INSERT INTO menu_categories (category_name, icon) VALUES (?, ?)',
          [cleanCategory, '🍽️']
        );
        categoryId = result.insertId;
      }
    }

    // 2. Insert Item
    const sql = `
      INSERT INTO menu_items (item_name, category_id, price, image, description, availability, rating, popular) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      item_name || name || 'New Item',
      categoryId,
      price || 0,
      image || '🍽️',
      description || '',
      available || 'In Stock',
      data.rating || 0,
      data.popular ? 1 : 0
    ];

    const [insertResult] = await pool.execute(sql, params);
    return insertResult.insertId;
  }

  async update(id, data) {
    const { name, item_name, category, category_id, price, image, description, available } = data;
    
    const updateData = {};
    
    // Map fields if they exist
    if (name || item_name) updateData.item_name = name || item_name;
    if (price !== undefined) updateData.price = price;
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (available !== undefined) updateData.availability = available;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.popular !== undefined) updateData.popular = data.popular ? 1 : 0;

    // Resolve Category if name is provided
    if (category && !category_id) {
      const cleanCategory = category === 'All Items' ? 'Bar' : category;
      const [catRows] = await pool.execute(
        'SELECT id FROM menu_categories WHERE category_name = ? AND deletedAt IS NULL',
        [cleanCategory]
      );
      
      if (catRows.length > 0) {
        updateData.category_id = catRows[0].id;
      } else {
        const [result] = await pool.execute(
          'INSERT INTO menu_categories (category_name, icon) VALUES (?, ?)',
          [cleanCategory, '🍽️']
        );
        updateData.category_id = result.insertId;
      }
    } else if (category_id) {
      updateData.category_id = category_id;
    }

    if (Object.keys(updateData).length === 0) return 0;

    const keys = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const sql = `UPDATE menu_items SET ${setClause} WHERE id = ?`;
    const [result] = await pool.execute(sql, [...values, id]);
    return result.affectedRows;
  }

  async getCategories() {
    const [rows] = await pool.execute('SELECT * FROM menu_categories WHERE deletedAt IS NULL');
    return rows;
  }
}

module.exports = new MenuModel();
