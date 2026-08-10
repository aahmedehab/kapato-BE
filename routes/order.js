const express = require("express");

const adminAuth = require("../middleware/adminAuth");

const {
  placeOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", placeOrder);

router.get("/", adminAuth, getOrders);
router.put("/:id/status", adminAuth, updateOrderStatus);

module.exports = router;