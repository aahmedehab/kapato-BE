const express = require("express");

const {
  getShippingRates,
  getShippingRate,
  createShippingRate,
  updateShippingRate,
  deleteShippingRate,
} = require("../controllers/shippingController");

const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Public
router.get("/", getShippingRates);
router.get("/:id", getShippingRate);

// Admin only
router.post("/", adminAuth, createShippingRate);
router.put("/:id", adminAuth, updateShippingRate);
router.delete("/:id", adminAuth, deleteShippingRate);

module.exports = router;