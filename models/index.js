const Product = require("./Product");
const ProductVariant = require("./ProductVariant");
const Color = require("./Color");

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

module.exports = {
    Product,
    ProductVariant,
    Color,
};