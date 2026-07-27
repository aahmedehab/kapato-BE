const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    order_number: DataTypes.BIGINT,

    customer_name: DataTypes.STRING,

    email: DataTypes.STRING,

    phone: DataTypes.STRING,

    address: DataTypes.TEXT,

    city: DataTypes.STRING,

    governorate: DataTypes.STRING,

    subtotal: DataTypes.INTEGER,

    shipping: DataTypes.INTEGER,

    total: DataTypes.INTEGER,

    created_at: DataTypes.DATE,

    status: {
      type: DataTypes.STRING,
      defaultValue: "Pending",
    },

  },
  {
    tableName: "orders",
    timestamps: false,
  }
);

module.exports = Order;