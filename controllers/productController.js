const { Product, ProductVariant, Color } = require("../models");

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: ProductVariant,
          as: "variants",
        },
      ],
    });

    const result = products.map((product) => {
      const data = product.toJSON();
      return {
        ...data,
        colors_count: data.variants.length,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductVariant,
          as: "variants",
          include: [
            {
              model: Color,
              as: "color",
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // امسح الـ variants الأول
    await ProductVariant.destroy({
      where: { product_id: product.id },
    });

    await product.destroy();

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, is_active, img, slug } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.description = description ?? product.description;
    product.is_active = is_active ?? product.is_active;
    product.img = img ?? product.img;
    product.slug = slug ?? product.slug;

    await product.save();

    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const addVariant = async (req, res) => {
  try {
    const { product_id, color_id, sku, image, stock } = req.body;

    const variant = await ProductVariant.create({
      product_id,
      color_id,
      sku,
      image,
      stock: stock || 0,
    });

    res.status(201).json(variant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.findByPk(req.params.id);

    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    await variant.destroy();
    res.json({ message: "Variant deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  addVariant,
  deleteVariant,
};