const {
  Order,
  OrderItem,
  PromoCode,
  ShippingRate,
  Product,
  ProductVariant,
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
      paymentMethod,
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

    if (!["cod", "instapay"].includes(paymentMethod)) {
  await transaction.rollback();

  return res.status(400).json({
    success: false,
    message: "Invalid payment method",
  });
}

    // =========================
    // Calculate subtotal SERVER-SIDE
    // =========================

let subtotal = 0;
const validatedCart = [];

for (const item of cart) {
  const quantity = Number(item.quantity);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Invalid cart quantity");
  }

  // Get the real product from DB
  const product = await Product.findByPk(item.id, {
    transaction,
  });

  if (!product || !product.is_active) {
    throw new Error(`Product not found: ${item.id}`);
  }

  // Get the selected variant from DB
  let variant = null;

  if (item.variantId) {
    variant = await ProductVariant.findOne({
      where: {
        id: item.variantId,
        product_id: product.id,
      },
      transaction,
    });

    if (!variant) {
      throw new Error(`Invalid product variant: ${item.variantId}`);
    }

    if (Number(variant.stock) < quantity) {
  throw new Error(
    `Insufficient stock for product variant: ${item.variantId}`
  );
}

variant.stock -= quantity;

await variant.save({ transaction });

  }

  // Use price ONLY from DB
  const price = Number(product.price);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Invalid product price: ${product.id}`);
  }

  subtotal += price * quantity;

  validatedCart.push({
  ...item,
  price,
  quantity,
  sku: variant?.sku || item.sku,
});
}

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

// Normal shipping price
let shipping = Number(shippingRate.price);



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

      
if (
  promo.discount_value !== null &&
  promo.discount_value !== undefined &&
  Number(promo.discount_value) > 0
) {
  if (promo.discount_type === "percentage") {
    discount =
      calculatedSubtotal *
      (Number(promo.discount_value) / 100);
  } else if (promo.discount_type === "fixed") {
    discount = Number(promo.discount_value);
  }
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

if (promo && promo.free_shipping) {
  shipping = 0;
}

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

        payment_method: paymentMethod,

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
      validatedCart.map((item) => ({
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

    const orderDetails = validatedCart
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
// Send Emails
// =========================

try {
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
      freeShipping: Boolean(promo?.free_shipping),
      total,
      paymentMethod: paymentMethod,
    }),
  });

  console.log("Admin order email sent successfully");

} catch (emailError) {
  console.error("Admin email failed:", emailError);
}

try {
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
      freeShipping: Boolean(promo?.free_shipping),
      total,
      paymentMethod: paymentMethod,
    }),
  });

  console.log("Customer order email sent successfully");

} catch (emailError) {
  console.error("Customer email failed:", emailError);
}

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
  freeShipping: Boolean(promo?.free_shipping),
  shipping,
  total,
  paymentMethod: paymentMethod,
});



    // Rollback only if transaction wasn't already committed
    } catch (err) {
  console.error("Place order error:", err);

  if (!transaction.finished) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error(
        "Transaction rollback error:",
        rollbackError
      );
    }
  }

  return res.status(500).json({
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