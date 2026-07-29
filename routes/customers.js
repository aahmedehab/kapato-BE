const express = require("express");

const router = express.Router();

const {
  getCustomers,
  getCustomerDetails,
} = require("../controllers/customerController");

router.get("/", getCustomers);

router.get("/:email", getCustomerDetails);

module.exports = router;