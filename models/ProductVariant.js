const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ProductVariant = sequelize.define(
  "ProductVariant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    color_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sku: DataTypes.STRING,

    image: DataTypes.STRING,

    stock: DataTypes.INTEGER,
  },
  {
    tableName: "product_variants",
    timestamps: false,
  }
);

module.exports = ProductVariant;