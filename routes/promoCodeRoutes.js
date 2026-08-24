const express = require("express");

const {
  getPromoCodes,
  getPromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
} = require("../controllers/promoCodeController");

const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Customer
router.post("/validate", validatePromoCode);

// Admin
router.get("/", adminAuth, getPromoCodes);

router.get("/:id", adminAuth, getPromoCode);

router.post("/", adminAuth, createPromoCode);

router.put("/:id", adminAuth, updatePromoCode);

router.delete("/:id", adminAuth, deletePromoCode);

module.exports = router;