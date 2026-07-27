const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    variant_id: DataTypes.INTEGER,

    product_name: DataTypes.STRING,

    sku: DataTypes.STRING,
    color: DataTypes.STRING,

    quantity: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
  },
  {
    tableName: "order_items",
    timestamps: false,
  }
);

module.exports = OrderItem;