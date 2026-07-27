const Product = require("./Product");
const ProductVariant = require("./ProductVariant");
const Color = require("./Color");

const Order = require("./Order");
const OrderItem = require("./OrderItem");

Product.hasMany(ProductVariant, {
  foreignKey: "product_id",
  as: "variants",
});

ProductVariant.belongsTo(Product, {
  foreignKey: "product_id",
});

ProductVariant.belongsTo(Color, {
  foreignKey: "color_id",
  as: "color",
});

Color.hasMany(ProductVariant, {
  foreignKey: "color_id",
});

Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items",
});

OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
});

module.exports = {
  Product,
  ProductVariant,
  Color,
  Order,
  OrderItem,
};