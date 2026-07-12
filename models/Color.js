const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Color = sequelize.define(
  "Color",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: DataTypes.STRING,

    hex_code: DataTypes.STRING,
  },
  {
    tableName: "colors",
    timestamps: false,
  }
);

module.exports = Color;