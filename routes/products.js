const express = require('express');
const { Product, ProductVariant, Color } = require("../models");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
const products = await Product.findAll({
  include: [
    {
      model: ProductVariant,
      as: "variants",
    },
  ],
});

const result = products.map((product) => {
  const data = product.toJSON();

  return {
    ...data,
    colors_count: data.variants.length,
  };
});

res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductVariant,
          as: "variants",
          include: [
            {
              model: Color,
              as: "color",
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error",
    });
  }
});

module.exports = router;