const { Op, fn, col, literal } = require("sequelize");

const {
  Order,
  OrderItem,
  Product,
  ProductVariant,
  Color,
} = require("../models");

const getDashboard = async (req, res) => {
  try {
    // Cards

    const totalRevenue =
      (await Order.sum("total")) || 0;

    const totalOrders =
      await Order.count();

    const totalCustomers = await Order.count({
      distinct: true,
      col: "email",
    });

    const totalProducts =
      await Product.count();

    // Inventory

    const totalVariants =
      await ProductVariant.count();

    const totalColors =
      await Color.count();

    // Latest Orders

    const recentOrders = await Order.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
    });

    // Latest Customers

    const latestCustomers = await Order.findAll({
      attributes: [
        "customer_name",
        "email",
        "total",
        "created_at",
      ],

      order: [["created_at", "DESC"]],

      limit: 5,
    });

    // Status Count

    const statuses = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const statusCounts = {};

    const averageOrderValue = totalOrders
  ? Math.round(totalRevenue / totalOrders)
  : 0;

  const topProducts = await OrderItem.findAll({
  attributes: [
    "product_name",
    [fn("SUM", col("quantity")), "sold"],
  ],
  group: ["product_name"],
  order: [[literal("sold"), "DESC"]],
  limit: 5,
});

const topColors = await OrderItem.findAll({
  attributes: [
    "color",
    [fn("SUM", col("quantity")), "sold"],
  ],
  group: ["color"],
  order: [[literal("sold"), "DESC"]],
  limit: 5,
});

const topCities = await Order.findAll({
  attributes: [
    "city",
    [fn("COUNT", col("id")), "orders"],
  ],
  group: ["city"],
  order: [[literal("orders"), "DESC"]],
  limit: 5,
});

const customerOrders = await Order.findAll({
  attributes: [
    "email",
    [fn("COUNT", col("id")), "orders"],
  ],
  group: ["email"],
});

const returningCustomers = customerOrders.filter(
  (c) => Number(c.dataValues.orders) > 1
).length;

const returningPercentage = totalCustomers
  ? Math.round((returningCustomers / totalCustomers) * 100)
  : 0;

  const revenueChart = await Order.findAll({
  attributes: [
    [fn("TO_CHAR", col("created_at"), "Mon"), "month"],
    [fn("SUM", col("total")), "revenue"],
  ],

  group: [fn("TO_CHAR", col("created_at"), "Mon")],

  order: [
    [fn("MIN", col("created_at")), "ASC"],
  ],
});


    for (const status of statuses) {
      statusCounts[status] =
        await Order.count({
          where: {
            status,
          },
        });
    }

res.json({
  cards: {
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
  },

  inventory: {
    totalVariants,
    totalColors,
  },

  averageOrderValue,

  revenueChart,

  recentOrders,

  latestCustomers,

  topProducts,

  topColors,

  topCities,

  returningCustomers,

  returningPercentage,

  statusCounts,
});

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server Error",
    });
  }
};

module.exports = {
  getDashboard,
};