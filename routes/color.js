const express = require("express");
const router = express.Router();

const {
  getColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor,
} = require("../controllers/colorController");

const adminAuth = require("../middleware/adminAuth");

router.get("/", adminAuth, getColors);
router.get("/:id", adminAuth, getColorById);

router.post("/", adminAuth, createColor);
router.put("/:id", adminAuth, updateColor);
router.delete("/:id", adminAuth, deleteColor);

module.exports = router;