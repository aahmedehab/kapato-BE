const express = require("express");
const {
  getProducts,
  getProductById,
  deleteProduct,
  getColors,
  updateProduct,
  addVariant,
  deleteVariant,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

router.put("/:id", updateProduct);

router.post("/variants", addVariant);
router.delete("/variants/:id", deleteVariant);


module.exports = router;