const express = require('express');
const Product = require("../models/Product");

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);

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