const { Color, ProductVariant, Product } = require("../models");

// Get all colors
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

// Get single color
const getColorById = async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.id);

    if (!color) {
      return res.status(404).json({ error: "Color not found" });
    }

    res.json(color);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create color
const createColor = async (req, res) => {
  try {
    const { name, hex_code } = req.body;

    if (!name || !hex_code) {
      return res.status(400).json({
        error: "Name and hex_code are required",
      });
    }

    const existing = await Color.findOne({
      where: { name },
    });

    if (existing) {
      return res.status(409).json({
        error: "Color already exists",
      });
    }

    const color = await Color.create({
      name,
      hex_code,
    });

    res.status(201).json(color);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update color
const updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hex_code } = req.body;

    const color = await Color.findByPk(id);

    if (!color) {
      return res.status(404).json({
        error: "Color not found",
      });
    }

    const duplicate = await Color.findOne({
      where: { name },
    });

    if (duplicate && duplicate.id !== color.id) {
      return res.status(409).json({
        error: "Color name already exists",
      });
    }

    await color.update({
      name,
      hex_code,
    });

    res.json(color);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete color
const deleteColor = async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.id);

    if (!color) {
      return res.status(404).json({
        error: "Color not found",
      });
    }

    const variants = await ProductVariant.findAll({
      where: {
        color_id: color.id,
      },
      include: [
        {
          model: Product,
          attributes: ["id", "name"],
        },
      ],
    });

    if (variants.length > 0) {
      return res.status(409).json({
        error: "This color cannot be deleted because it is used by products.",
        products: variants.map((v) => ({
          id: v.Product.id,
          name: v.Product.name,
        })),
      });
    }

    await color.destroy();

    res.json({
      message: "Color deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server Error",
    });
  }
};

module.exports = {
  getColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor,
};