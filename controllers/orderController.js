const {
  Order,
  OrderItem,
  PromoCode,
  ShippingRate,
} = require("../models");
const sequelize = require("../config/db");
const { DateTime } = require("luxon");

const transporter = require("../config/mailer");
const orderAdminEmailTemplate = require("../templates/orderAdminEmail");
const orderCustomerEmailTemplate = require("../templates/orderCustomerEmail");

const placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      customer,
      cart,
      promoCode,
    } = req.body;

    // =========================
    // Basic validation
    // =========================

    if (!customer) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Customer information is required",
      });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // =========================
    // Calculate subtotal SERVER-SIDE
    // =========================

    const subtotal = cart.reduce((sum, item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        throw new Error("Invalid cart item");
      }

      return sum + price * quantity;
    }, 0);

    // Your current system uses INTEGER EGP
    const calculatedSubtotal = Math.round(subtotal);

    // =========================
    // Shipping
    // =========================

const shippingRate = await ShippingRate.findOne({
  where: {
    governorate: customer.governorate,
  },
  transaction,
});

if (!shippingRate) {
  await transaction.rollback();

  return res.status(400).json({
    success: false,
    message: "Shipping is not available for this governorate",
  });
}

const shipping = Number(shippingRate.price);

    // =========================
    // Promo Code
    // =========================

    let promo = null;
    let discount = 0;

    if (promoCode && promoCode.trim()) {
      const normalizedCode = promoCode.trim().toUpperCase();

      /*
       * IMPORTANT:
       *
       * lock: transaction.LOCK.UPDATE
       *
       * This prevents two customers from using
       * the last credit at the exact same time.
       */
      promo = await PromoCode.findOne({
        where: {
          code: normalizedCode,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!promo) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "Invalid promo code",
        });
      }

      if (!promo.is_active) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "This promo code is inactive",
        });
      }

      if (promo.credits <= 0) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "This promo code has no credits left",
        });
      }

      // =========================
      // Calculate discount
      // =========================

      if (promo.discount_type === "percentage") {
        discount =
          calculatedSubtotal *
          (Number(promo.discount_value) / 100);
      } else if (promo.discount_type === "fixed") {
        discount = Number(promo.discount_value);
      }

      // Discount cannot exceed subtotal
      discount = Math.min(
        discount,
        calculatedSubtotal
      );

      // Keep whole EGP
      discount = Math.round(discount);

      // =========================
      // Consume ONE credit
      // =========================

      promo.credits -= 1;

      await promo.save({ transaction });
    }

    // =========================
    // Final total
    // =========================

    const finalSubtotal =
      calculatedSubtotal - discount;

    const total =
      finalSubtotal + shipping;

    // =========================
    // Cairo time
    // =========================

    const cairoNow = DateTime.now()
      .setZone("Africa/Cairo")
      .toJSDate();

    // =========================
    // Create Order
    // =========================

    const order = await Order.create(
      {
        customer_name: customer.customer_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        apartment: customer.apartment || null,
        city: customer.city,
        governorate: customer.governorate,
        postal_code: customer.postalCode || null,

        subtotal: calculatedSubtotal,
        shipping,
        total,

        promo_code_id: promo ? promo.id : null,
        promo_code: promo ? promo.code : null,
        promo_discount: discount,

        created_at: cairoNow,
      },
      {
        transaction,
      }
    );

    // =========================
    // Create Order Items
    // =========================

    await OrderItem.bulkCreate(
      cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        variant_id: item.variantId || null,
        product_name: item.name,
        sku: item.sku,
        color: item.color,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      {
        transaction,
      }
    );

    // =========================
    // Commit transaction
    // =========================

    await transaction.commit();

    // =========================
    // Email details
    // =========================

    const orderDetails = cart
      .map(
        (item) => `
          <div style="margin-bottom:15px;">
            <p style="margin:0 0 5px; font-size:14px; font-weight:bold; color:#111111;">
              ${item.name}
            </p>

            <p style="margin:0; font-size:13px; color:#666666;">
              ${item.color} • SKU: ${item.sku} • Qty: ${item.quantity}
            </p>

            <p style="margin:5px 0 0; font-size:13px; color:#111111;">
              ${Number(item.price) * Number(item.quantity)} LE
            </p>
          </div>
        `
      )
      .join("");

    // =========================
    // Admin Email
    // =========================

    await transporter.sendMail({
      from: {
        name: "KAPATO",
        address: process.env.MAIL_FROM,
      },

      to: process.env.MAIL_TO,

      replyTo: customer.email,

      subject: `New Order #${order.order_number}`,

      html: orderAdminEmailTemplate({
        orderId: order.order_number,

        customerName: customer.customer_name,

        email: customer.email,

        phone: customer.phone,

        address: [
          customer.address,
          customer.apartment,
          customer.city,
          customer.governorate,
          customer.postalCode,
        ]
          .filter(Boolean)
          .join(", "),

        items: orderDetails,

        subtotal: calculatedSubtotal,

        promoCode: promo?.code || null,

        promoDiscount: discount,

        shipping,

        total,
      }),
    });

    // =========================
    // Customer Email
    // =========================

    await transporter.sendMail({
      from: {
        name: "KAPATO",
        address: process.env.MAIL_FROM,
      },

      to: customer.email,

      subject: `Order Confirmation #${order.order_number}`,

      html: orderCustomerEmailTemplate({
        orderId: order.order_number,

        customerName: customer.customer_name,

        email: customer.email,

        phone: customer.phone,

        address: [
          customer.address,
          customer.apartment,
          customer.city,
          customer.governorate,
          customer.postalCode,
        ]
          .filter(Boolean)
          .join(", "),

        items: orderDetails,

        subtotal: calculatedSubtotal,

        promoCode: promo?.code || null,

        promoDiscount: discount,

        shipping,

        total,
      }),
    });

    // =========================
    // Response
    // =========================

    res.status(201).json({
      success: true,

      orderId: order.order_number,

      orderDbId: order.id,

      subtotal: calculatedSubtotal,

      promoCode: promo?.code || null,

      promoDiscount: discount,

      shipping,

      total,
    });

  } catch (err) {
    console.error("Place order error:", err);

    // Rollback only if transaction wasn't already committed
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error(
        "Transaction rollback error:",
        rollbackError
      );
    }

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(orders);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({
      message: "Status updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  updateOrderStatus,
};