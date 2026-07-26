const {
  createOrder,
  createOrderItem,
} = require("../models/orderModel");

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


    const order = await createOrder({

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

    for (const item of cart) {
      await createOrderItem({
        orderId: order.id,

        productId: item.id,
        variantId: item.variantId,

        productName: item.name,

        sku: item.sku,
        color: item.color,

        quantity: item.quantity,
        price: item.price,
      });
    }

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

module.exports = {
  placeOrder,
};