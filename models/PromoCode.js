const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PromoCode = sequelize.define(
  "PromoCode",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("code", value?.trim().toUpperCase());
      },
    },

    discount_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [["percentage", "fixed"]],
      },
    },

    discount_value: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
  defaultValue: 0,
  validate: {
    min: 0,
  },
},

free_shipping: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
},

    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    free_shipping: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "promo_codes",
    timestamps: false,
  }
);

module.exports = PromoCode;