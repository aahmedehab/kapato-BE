const db = require("../config/db");

const Product = {
  getAll: async () => {
    const result = await db.query(`
      SELECT
        p.*,
        COUNT(v.id) AS colors_count
      FROM products p
      LEFT JOIN product_variants v
        ON p.id = v.product_id
      GROUP BY p.id
      ORDER BY p.id DESC
    `);

    return result.rows;
  },





  getById: async (id) => {
    const product = await db.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (product.rows.length === 0) {
      return null;
    }

const variants = await db.query(
  `
  SELECT
    pv.id,
    pv.product_id,
    pv.sku,
    pv.image,
    pv.stock,
    c.name AS color_name,
    c.hex_code
  FROM product_variants pv
  JOIN colors c
    ON pv.color_id = c.id
  WHERE pv.product_id = $1
  `,
  [id]
);

    return {
      product: product.rows[0],
      variants: variants.rows,
    };
  },
};

module.exports = Product;