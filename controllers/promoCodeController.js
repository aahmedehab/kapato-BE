const {
  PromoCode,
  Product,
  ProductVariant,
} = require("../models");

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
  free_shipping,
} = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Promo code is required",
      });
    }

    const promoCredits = Number(credits);

if (!Number.isInteger(promoCredits) || promoCredits < 0) {
  return res.status(400).json({
    success: false,
    message: "Credits must be a valid number greater than or equal to 0",
  });
}

const hasDiscount =
  discount_value !== undefined &&
  discount_value !== null &&
  discount_value !== "" &&
  Number(discount_value) > 0;

const hasFreeShipping = Boolean(free_shipping);

if (!hasDiscount && !hasFreeShipping) {
  return res.status(400).json({
    success: false,
    message: "Promo code must have a discount or free shipping",
  });
}

let normalizedDiscountValue = 0;

if (hasDiscount) {
  if (!["percentage", "fixed"].includes(discount_type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid discount type",
    });
  }

  normalizedDiscountValue = Number(discount_value);

  if (
    !Number.isFinite(normalizedDiscountValue) ||
    normalizedDiscountValue <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Discount value must be greater than 0",
    });
  }

  if (
    discount_type === "percentage" &&
    normalizedDiscountValue > 100
  ) {
    return res.status(400).json({
      success: false,
      message: "Percentage discount cannot exceed 100%",
    });
  }
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
  discount_type: hasDiscount ? discount_type : "fixed",
  discount_value: normalizedDiscountValue,
  credits: promoCredits,
  is_active: is_active ?? true,
  free_shipping: hasFreeShipping,
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
      free_shipping,
    } = req.body;

    // =========================
    // Code
    // =========================

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

    // =========================
    // Credits
    // =========================

    if (credits !== undefined) {
      const promoCredits = Number(credits);

      if (!Number.isInteger(promoCredits) || promoCredits < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Credits must be a valid number greater than or equal to 0",
        });
      }

      promo.credits = promoCredits;
    }

    // =========================
    // Active
    // =========================

    if (is_active !== undefined) {
      promo.is_active = Boolean(is_active);
    }

    // =========================
    // Free Shipping
    // =========================

    const hasFreeShipping =
      free_shipping !== undefined
        ? Boolean(free_shipping)
        : Boolean(promo.free_shipping);

    // =========================
    // Discount
    // =========================

    const newDiscountValue =
      discount_value !== undefined
        ? discount_value
        : promo.discount_value;

    const newDiscountType =
      discount_type !== undefined
        ? discount_type
        : promo.discount_type;

    const hasDiscount =
      newDiscountValue !== undefined &&
      newDiscountValue !== null &&
      newDiscountValue !== "" &&
      Number(newDiscountValue) > 0;

    // Promo must have either discount OR free shipping
    if (!hasDiscount && !hasFreeShipping) {
      return res.status(400).json({
        success: false,
        message:
          "Promo code must have a discount or free shipping",
      });
    }

    // =========================
    // Validate discount
    // =========================

    if (hasDiscount) {
      if (!["percentage", "fixed"].includes(newDiscountType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid discount type",
        });
      }

      const normalizedDiscountValue =
        Number(newDiscountValue);

      if (
        !Number.isFinite(normalizedDiscountValue) ||
        normalizedDiscountValue <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount value must be greater than 0",
        });
      }

      if (
        newDiscountType === "percentage" &&
        normalizedDiscountValue > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Percentage discount cannot exceed 100%",
        });
      }

      promo.discount_type = newDiscountType;
      promo.discount_value = normalizedDiscountValue;
    } else {
      // Free shipping only
      promo.discount_type = "fixed";
      promo.discount_value = 0;
    }

    promo.free_shipping = hasFreeShipping;

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
    const { code, cart } = req.body;

    // =========================
    // Basic validation
    // =========================

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Promo code is required",
      });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // =========================
    // Calculate subtotal FROM DB
    // =========================

    let subtotal = 0;

    for (const item of cart) {
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart quantity",
        });
      }

      const product = await Product.findByPk(item.id);

      if (!product || !product.is_active) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.id}`,
        });
      }

      // Validate variant if provided
      if (item.variantId) {
        const variant = await ProductVariant.findOne({
          where: {
            id: item.variantId,
            product_id: product.id,
          },
        });

        if (!variant) {
          return res.status(400).json({
            success: false,
            message: `Invalid product variant: ${item.variantId}`,
          });
        }
      }

      // IMPORTANT:
      // Price comes ONLY from DB
      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid product price: ${product.id}`,
        });
      }

      subtotal += price * quantity;
    }

    const orderSubtotal = Math.round(subtotal);

    // =========================
    // Find promo
    // =========================

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

    // =========================
    // Check active
    // =========================

    if (!promo.is_active) {
      return res.status(400).json({
        success: false,
        message: "This promo code is inactive",
      });
    }

    // =========================
    // Check credits
    // =========================

    if (promo.credits <= 0) {
      return res.status(400).json({
        success: false,
        message: "This promo code has no credits left",
      });
    }

    // =========================
    // Free Shipping
    // =========================

    const freeShipping = Boolean(promo.free_shipping);

    // =========================
    // Calculate discount
    // =========================

    let discount = 0;

    if (
      promo.discount_value !== null &&
      promo.discount_value !== undefined &&
      Number(promo.discount_value) > 0
    ) {
      if (promo.discount_type === "percentage") {
        discount =
          orderSubtotal *
          (Number(promo.discount_value) / 100);
      } else if (promo.discount_type === "fixed") {
        discount = Number(promo.discount_value);
      }
    }

    // Discount cannot exceed subtotal
    discount = Math.min(
      discount,
      orderSubtotal
    );

    // Keep whole EGP
    discount = Math.round(discount);

    const finalSubtotal =
      orderSubtotal - discount;

    // =========================
    // Response
    // =========================

    res.json({
      success: true,

      promo: {
        id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        free_shipping: freeShipping,
      },

      discount,

      finalSubtotal,

      freeShipping,

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