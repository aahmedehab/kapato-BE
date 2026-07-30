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

const router = express.Router();

router.post("/", addProduct);

router.get("/", getProducts);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

router.put("/:id", updateProduct);

router.post("/variants", addVariant);
router.delete("/variants/:id", deleteVariant);
router.put("/variants/:id", updateVariant);

module.exports = router;