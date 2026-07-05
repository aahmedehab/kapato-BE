const db = require('../config/db');

const Product = {
  getAll: async () => {
    const result = await db.query('SELECT * FROM products ORDER BY id DESC');
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  }
};

module.exports = Product;