const express = require("express");

const {
  getProducts,
  getProductById,
  deleteProduct,
  getColors,
  updateProduct,
  addProduct,
  addVariant,
  deleteVariant,
  updateVariant,
} = require("../controllers/productController");

const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin only
router.post("/", adminAuth, addProduct);

router.delete("/:id", adminAuth, deleteProduct);

router.put("/:id", adminAuth, updateProduct);

router.post("/variants", adminAuth, addVariant);
router.delete("/variants/:id", adminAuth, deleteVariant);
router.put("/variants/:id", adminAuth, updateVariant);

module.exports = router;