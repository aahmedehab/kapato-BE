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

    apartment: {
  type: DataTypes.STRING,
  allowNull: true,
},

    city: DataTypes.STRING,

    governorate: DataTypes.STRING,

    postal_code: {
  type: DataTypes.STRING,
  allowNull: true,
},

    subtotal: DataTypes.INTEGER,

    shipping: DataTypes.INTEGER,

    total: DataTypes.INTEGER,
    
    promo_code_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
},
    promo_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },


    promo_discount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    created_at: {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW,
},

    status: {
      type: DataTypes.STRING,
      defaultValue: "Pending",
    },
    
    payment_method: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: "cod",
},

  },
  {
    tableName: "orders",
    timestamps: false,
  }
);

module.exports = Order;