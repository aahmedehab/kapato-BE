const sequelize = require("../config/db");

const createOrder = async ({
  orderNumber,
  customer_name,
  email,
  phone,
  address,
  city,
 governorate,
  subtotal,
  shipping,
  total,
}) => {
  const [rows] = await sequelize.query(
    `
    INSERT INTO orders
    (
        customer_name,
        email,
        phone,
        address,
        city,
        governorate,
        subtotal,
        shipping,
        total
    )

    VALUES
    (
        :customer_name,
        :email,
        :phone,
        :address,
        :city,
        :governorate,
        :subtotal,
        :shipping,
        :total
    )

    RETURNING *
`,
    {
      replacements: {
        customer_name,
        email,
        phone,
        address,
        city,
        governorate,
        subtotal,
        shipping,
        total,
      },
    }
  );

  return rows[0];
};

const createOrderItem = async ({
  orderId,
  productId,
  variantId,
  productName,
  sku,
  color,
  quantity,
  price,
}) => {
  await sequelize.query(
    `
INSERT INTO order_items
(
    order_id,
    product_id,
    variant_id,
    product_name,
    sku,
    color,
    quantity,
    price
)

VALUES
(
    :orderId,
    :productId,
    :variantId,
    :productName,
    :sku,
    :color,
    :quantity,
    :price
)
`,
    {
      replacements: {
        orderId,
        productId,
        variantId,
        productName,
        sku,
        color,
        quantity,
        price,
      },
    }
  );
};

module.exports = {
  createOrder,
  createOrderItem,
};