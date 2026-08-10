const express = require("express");

const router = express.Router();

const {
  getDashboard,
} = require("../controllers/dashboardController");

const adminAuth = require("../middleware/adminAuth");

router.get("/", adminAuth, getDashboard);

module.exports = router;