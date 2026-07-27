const { Color } = require("../models");

const getColors = async (req, res) => {
  try {
    const colors = await Color.findAll({
      order: [["name", "ASC"]],
    });
    res.json(colors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getColors,
};