const express = require("express");
const router = express.Router();

const {
  getColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor,
} = require("../controllers/colorController");

router.get("/", getColors);
router.get("/:id", getColorById);
router.post("/", createColor);
router.put("/:id", updateColor);
router.delete("/:id", deleteColor);

module.exports = router;