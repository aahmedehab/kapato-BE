const Product = require("./Product");
const ProductVariant = require("./ProductVariant");
const Color = require("./Color");

const Order = require("./Order");
const OrderItem = require("./OrderItem");

const PromoCode = require("./PromoCode");

const Admin = require("./Admin");

// Product ↔ Variants
Product.hasMany(ProductVariant, {
  foreignKey: "product_id",
  as: "variants",
});

ProductVariant.belongsTo(Product, {
  foreignKey: "product_id",
});

// Variant ↔ Color
ProductVariant.belongsTo(Color, {
  foreignKey: "color_id",
  as: "color",
});

Color.hasMany(ProductVariant, {
  foreignKey: "color_id",
});

// Order ↔ Order Items
Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items",
});

OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
});

OrderItem.belongsTo(ProductVariant, {
  foreignKey: "variant_id",
  as: "variant",
});

ProductVariant.hasMany(OrderItem, {
  foreignKey: "variant_id",
  as: "orderItems",
});

// Promo Code ↔ Orders
PromoCode.hasMany(Order, {
  foreignKey: "promo_code_id",
  as: "orders",
});

Order.belongsTo(PromoCode, {
  foreignKey: "promo_code_id",
  as: "promoCode",
});

module.exports = {
  Product,
  ProductVariant,
  Color,
  Order,
  OrderItem,
  PromoCode,
  Admin,
};