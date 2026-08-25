const { ShippingRate } = require("../models");

// =========================
// GET ALL SHIPPING RATES
// =========================

const getShippingRates = async (req, res) => {
  try {
    const rates = await ShippingRate.findAll({
      order: [["governorate", "ASC"]],
    });

    res.json({
      success: true,
      shippingRates: rates,
    });
  } catch (error) {
    console.error("Get shipping rates error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch shipping rates",
    });
  }
};

// =========================
// GET ONE SHIPPING RATE
// =========================

const getShippingRate = async (req, res) => {
  try {
    const { id } = req.params;

    const rate = await ShippingRate.findByPk(id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Shipping rate not found",
      });
    }

    res.json({
      success: true,
      shippingRate: rate,
    });
  } catch (error) {
    console.error("Get shipping rate error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch shipping rate",
    });
  }
};

// =========================
// CREATE SHIPPING RATE
// =========================

const createShippingRate = async (req, res) => {
  try {
    const { governorate, price } = req.body;

    if (!governorate || governorate.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Governorate is required",
      });
    }

    const shippingPrice = Number(price);

    if (!Number.isFinite(shippingPrice) || shippingPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipping price",
      });
    }

    const normalizedGovernorate = governorate.trim();

    const existing = await ShippingRate.findOne({
      where: {
        governorate: normalizedGovernorate,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Shipping rate for this governorate already exists",
      });
    }

    const shippingRate = await ShippingRate.create({
      governorate: normalizedGovernorate,
      price: Math.round(shippingPrice),
    });

    res.status(201).json({
      success: true,
      message: "Shipping rate created successfully",
      shippingRate,
    });
  } catch (error) {
    console.error("Create shipping rate error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create shipping rate",
    });
  }
};

// =========================
// UPDATE SHIPPING RATE
// =========================

const updateShippingRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { governorate, price } = req.body;

    const shippingRate = await ShippingRate.findByPk(id);

    if (!shippingRate) {
      return res.status(404).json({
        success: false,
        message: "Shipping rate not found",
      });
    }

    if (!governorate || governorate.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Governorate is required",
      });
    }

    const shippingPrice = Number(price);

    if (!Number.isFinite(shippingPrice) || shippingPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipping price",
      });
    }

    const normalizedGovernorate = governorate.trim();

    const existing = await ShippingRate.findOne({
      where: {
        governorate: normalizedGovernorate,
      },
    });

    if (existing && existing.id !== shippingRate.id) {
      return res.status(400).json({
        success: false,
        message: "Another shipping rate already uses this governorate",
      });
    }

    shippingRate.governorate = normalizedGovernorate;
    shippingRate.price = Math.round(shippingPrice);

    await shippingRate.save();

    res.json({
      success: true,
      message: "Shipping rate updated successfully",
      shippingRate,
    });
  } catch (error) {
    console.error("Update shipping rate error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update shipping rate",
    });
  }
};

// =========================
// DELETE SHIPPING RATE
// =========================

const deleteShippingRate = async (req, res) => {
  try {
    const { id } = req.params;

    const shippingRate = await ShippingRate.findByPk(id);

    if (!shippingRate) {
      return res.status(404).json({
        success: false,
        message: "Shipping rate not found",
      });
    }

    await shippingRate.destroy();

    res.json({
      success: true,
      message: "Shipping rate deleted successfully",
    });
  } catch (error) {
    console.error("Delete shipping rate error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete shipping rate",
    });
  }
};

module.exports = {
  getShippingRates,
  getShippingRate,
  createShippingRate,
  updateShippingRate,
  deleteShippingRate,
};