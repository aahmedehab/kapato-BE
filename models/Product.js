const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: DataTypes.STRING,

    slug: DataTypes.STRING,

    description: DataTypes.TEXT,

    price: DataTypes.DECIMAL,

    old_price: DataTypes.DECIMAL,
    
    folder_path: DataTypes.STRING,
    
    is_active: DataTypes.BOOLEAN,
  },
  {
    tableName: "products",
    timestamps: false,
  }
);

module.exports = Product;