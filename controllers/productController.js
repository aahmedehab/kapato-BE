const {
  Product,
  ProductVariant,
  Color,
} = require("../models");






// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
include: [
  {
    model: ProductVariant,
    as: "variants",
    include: [
      {
        model: Color,
        as: "color",
        attributes: ["id", "name", "hex_code"],
      },
    ],
  },
],
    });

const result = products.map((product) => {
  const data = product.toJSON();


return {
  ...data,
  img: null,
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

const data = product.toJSON();

res.json(data);
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

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, folder_path, is_active, slug } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.description = description ?? product.description;
    product.is_active = is_active ?? product.is_active;
    product.slug = slug ?? product.slug;
    product.folder_path = folder_path ?? product.folder_path;

    await product.save();

    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// add product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      price,
      description,
      folder_path,
      is_active,
    } = req.body;

    const product = await Product.create({
      name,
      slug,
      price,
      description,
      folder_path,
      is_active,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error creating product",
    });
  }
};


// add variant
const addVariant = async (req, res) => {
  try {
    const { product_id, color_id, sku, folder_name, stock } = req.body;

    const variant = await ProductVariant.create({
      product_id,
      color_id,
      sku,
      folder_name,
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

const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, folder_name, stock, color_id } = req.body;

    const variant = await ProductVariant.findByPk(id);

    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    variant.sku = sku ?? variant.sku;
    variant.folder_name = folder_name ?? variant.folder_name;
    variant.stock = stock ?? variant.stock;
    variant.color_id = color_id ?? variant.color_id;

    await variant.save();

    res.json({
      message: "Variant updated successfully",
      variant,
    });
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
  updateVariant,
  addProduct,
};