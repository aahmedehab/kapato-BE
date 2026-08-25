const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ShippingRate = sequelize.define(
  "ShippingRate",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    governorate: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "shipping_rates",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ShippingRate;