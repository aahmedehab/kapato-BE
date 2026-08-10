const { Order, OrderItem } = require("../models");
const { DateTime } = require("luxon");
const transporter = require("../config/mailer");
const orderAdminEmailTemplate = require("../templates/orderAdminEmail");
const orderCustomerEmailTemplate = require("../templates/orderCustomerEmail");

const placeOrder = async (req, res) => {
  try {
    const {
      customer,
      cart,
      subtotal,
      shipping,
      total,
    } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const cairoNow = DateTime.now()
  .setZone("Africa/Cairo")
  .toJSDate();

    const order = await Order.create({
      customer_name: customer.customer_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      apartment: customer.apartment || null,
      city: customer.city,
      governorate: customer.governorate,
      postal_code: customer.postalCode || null,
      subtotal,
      shipping,
      total,
    });

    await OrderItem.bulkCreate(
      cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        variant_id: item.variantId || null,
        product_name: item.name,
        sku: item.sku,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
      }))
    );

const orderDetails = cart
  .map(
    (item) => `
      <div style="padding:12px 0; border-bottom:1px solid #eeeeee;">

        <p style="margin:0 0 5px; font-size:14px; font-weight:bold; color:#111111;">
          ${item.name}
        </p>

        <p style="margin:0; font-size:13px; color:#666666;">
          ${item.color} • SKU: ${item.sku} • Qty: ${item.quantity}
        </p>

        <p style="margin:5px 0 0; font-size:13px; color:#111111;">
          ${item.price * item.quantity} LE
        </p>

      </div>
    `
  )
  .join("");

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
    subtotal,
    shipping,
    total,
  }),
});

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
    subtotal,
    shipping,
    total,
  }),
});

    res.status(201).json({
      success: true,
      orderId: order.order_number,
      orderDbId: order.id,
    });
  } catch (err) {
    console.error(err);

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