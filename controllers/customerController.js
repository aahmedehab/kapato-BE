const { Op, fn, col } = require("sequelize");
const { Order, OrderItem } = require("../models");

// GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Order.findAll({
      attributes: [
        "email",

        [fn("MAX", col("customer_name")), "customer_name"],
        [fn("MAX", col("phone")), "phone"],
        [fn("COUNT", col("id")), "orders_count"],
        [fn("SUM", col("total")), "total_spent"],
        [fn("MAX", col("created_at")), "last_order"],
      ],

      where: {
        email: {
          [Op.ne]: null,
        },
      },

      group: ["email"],

      order: [[fn("MAX", col("created_at")), "DESC"]],
    });

    res.json(customers);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
};

// GET /api/customers/:email
const getCustomerDetails = async (req, res) => {
  try {
    const { email } = req.params;

    const orders = await Order.findAll({
      where: {
        email,
      },

      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],

      order: [["created_at", "DESC"]],
    });

    if (orders.length === 0) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    const customer = {
      customer_name: orders[0].customer_name,
      email: orders[0].email,
      phone: orders[0].phone,
      address: orders[0].address,
      city: orders[0].city,
      governorate: orders[0].governorate,

      orders_count: orders.length,

      total_spent: orders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      ),

      last_order: orders[0].created_at,
    };

    res.json({
      customer,
      orders,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerDetails,
};