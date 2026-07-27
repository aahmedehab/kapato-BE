const { Order, OrderItem } = require("../models");

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

    const order = await Order.create({
      customer_name: customer.customer_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      governorate: customer.governorate,
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