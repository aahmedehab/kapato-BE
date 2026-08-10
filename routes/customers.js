const express = require("express");

const router = express.Router();

const {
  getCustomers,
  getCustomerDetails,
} = require("../controllers/customerController");

const adminAuth = require("../middleware/adminAuth");

router.get("/", adminAuth, getCustomers);

router.get("/:email", adminAuth, getCustomerDetails);

module.exports = router;