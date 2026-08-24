const { PromoCode } = require("../models");

// GET /api/promocodes
const getPromoCodes = async (req, res) => {
  try {
    const promos = await PromoCode.findAll({
      order: [["created_at", "DESC"]],
    });

    res.json(promos);
  } catch (error) {
    console.error("Get promo codes error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch promo codes",
    });
  }
};

// GET /api/promocodes/:id
const getPromoCode = async (req, res) => {
  try {
    const { id } = req.params;

    const promo = await PromoCode.findByPk(id);

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    res.json(promo);
  } catch (error) {
    console.error("Get promo code error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch promo code",
    });
  }
};

// POST /api/promocodes
const createPromoCode = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      credits,
      is_active,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Promo code is required",
      });
    }

    if (!["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type",
      });
    }

    const discountValue = Number(discount_value);
    const promoCredits = Number(credits);

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be greater than 0",
      });
    }

    if (!Number.isInteger(promoCredits) || promoCredits < 0) {
      return res.status(400).json({
        success: false,
        message: "Credits must be a valid number greater than or equal to 0",
      });
    }

    // Percentage cannot exceed 100%
    if (discount_type === "percentage" && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const existing = await PromoCode.findOne({
      where: {
        code: normalizedCode,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Promo code already exists",
      });
    }

    const promo = await PromoCode.create({
      code: normalizedCode,
      discount_type,
      discount_value: discountValue,
      credits: promoCredits,
      is_active: is_active ?? true,
    });

    res.status(201).json({
      success: true,
      message: "Promo code created successfully",
      promo,
    });
  } catch (error) {
    console.error("Create promo code error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create promo code",
    });
  }
};

// PUT /api/promocodes/:id
const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;

    const promo = await PromoCode.findByPk(id);

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    const {
      code,
      discount_type,
      discount_value,
      credits,
      is_active,
    } = req.body;

    if (discount_type !== undefined) {
      if (!["percentage", "fixed"].includes(discount_type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid discount type",
        });
      }

      promo.discount_type = discount_type;
    }

    if (discount_value !== undefined) {
      const discountValue = Number(discount_value);

      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        return res.status(400).json({
          success: false,
          message: "Discount value must be greater than 0",
        });
      }

      if (
        promo.discount_type === "percentage" &&
        discountValue > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Percentage discount cannot exceed 100%",
        });
      }

      promo.discount_value = discountValue;
    }

    if (credits !== undefined) {
      const promoCredits = Number(credits);

      if (!Number.isInteger(promoCredits) || promoCredits < 0) {
        return res.status(400).json({
          success: false,
          message: "Credits must be a valid number greater than or equal to 0",
        });
      }

      promo.credits = promoCredits;
    }

    if (code !== undefined) {
      const normalizedCode = code.trim().toUpperCase();

      if (!normalizedCode) {
        return res.status(400).json({
          success: false,
          message: "Promo code cannot be empty",
        });
      }

      const existing = await PromoCode.findOne({
        where: {
          code: normalizedCode,
        },
      });

      if (existing && existing.id !== promo.id) {
        return res.status(409).json({
          success: false,
          message: "Promo code already exists",
        });
      }

      promo.code = normalizedCode;
    }

    if (is_active !== undefined) {
      promo.is_active = Boolean(is_active);
    }

    promo.updated_at = new Date();

    await promo.save();

    res.json({
      success: true,
      message: "Promo code updated successfully",
      promo,
    });
  } catch (error) {
    console.error("Update promo code error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update promo code",
    });
  }
};

// DELETE /api/promocodes/:id
const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;

    const promo = await PromoCode.findByPk(id);

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    // Don't delete if it was already used by an order
    const usedCount = await promo.countOrders();

    if (usedCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This promo code has already been used and cannot be deleted. Deactivate it instead.",
        usedCount,
      });
    }

    await promo.destroy();

    res.json({
      success: true,
      message: "Promo code deleted successfully",
    });
  } catch (error) {
    console.error("Delete promo code error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete promo code",
    });
  }
};

const validatePromoCode = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Promo code is required",
      });
    }

    const orderSubtotal = Number(subtotal);

    if (!Number.isFinite(orderSubtotal) || orderSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid subtotal",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const promo = await PromoCode.findOne({
      where: {
        code: normalizedCode,
      },
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Invalid promo code",
      });
    }

    if (!promo.is_active) {
      return res.status(400).json({
        success: false,
        message: "This promo code is inactive",
      });
    }

    if (promo.credits <= 0) {
      return res.status(400).json({
        success: false,
        message: "This promo code has no credits left",
      });
    }

    let discount = 0;

    if (promo.discount_type === "percentage") {
      discount =
        orderSubtotal * (Number(promo.discount_value) / 100);
    } else if (promo.discount_type === "fixed") {
      discount = Number(promo.discount_value);
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, orderSubtotal);

    // Keep it as whole EGP because your orders currently use INTEGER
    discount = Math.round(discount);

    const finalSubtotal = orderSubtotal - discount;

    res.json({
      success: true,

      promo: {
        id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: Number(promo.discount_value),
      },

      discount,
      finalSubtotal,
      remainingCredits: promo.credits,
    });
  } catch (error) {
    console.error("Validate promo code error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to validate promo code",
    });
  }
};

module.exports = {
  getPromoCodes,
  getPromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
};