const orderCustomerEmailTemplate = ({
  orderId,
  customerName,
  email,
  phone,
  address,
  items,
  subtotal,
  promoCode,
  promoDiscount,
  shipping,
  freeShipping,
  total,
  paymentMethod,
}) => `

<!DOCTYPE html>

<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation</title>
</head>

<body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">

  <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:16px; overflow:hidden;">


<!-- Header -->
<div style="background:#1230c6; padding:28px 30px; text-align:center;">
  <h1 style="margin:0; color:#f8dfc5; font-size:26px; letter-spacing:2px;">
    KAPATO
  </h1>

  <p style="margin:8px 0 0; color:#cccccc; font-size:13px;">
    Order Confirmation
  </p>
</div>

<!-- Content -->
<div style="padding:30px;">

  <h2 style="margin:0 0 25px; color:#111111; font-size:20px;">
    Thank you for your order #${orderId}
  </h2>

  <!-- Customer Info -->
  <div style="background:#f8f8f8; border-radius:12px; padding:20px; margin-bottom:25px;">

    <p style="margin:0 0 12px; font-size:14px; color:#555555;">
      <strong style="color:#111111;">Customer:</strong>
      ${customerName}
    </p>

    <p style="margin:0 0 12px; font-size:14px; color:#555555;">
      <strong style="color:#111111;">Email:</strong>
      ${email}
    </p>

    <p style="margin:0 0 12px; font-size:14px; color:#555555;">
      <strong style="color:#111111;">Phone:</strong>
      ${phone}
    </p>

    <p style="margin:0; font-size:14px; color:#555555;">
      <strong style="color:#111111;">Address:</strong>
      ${address}
    </p>

  </div>

   <div style="background:#fafafa; border-radius:10px; padding:18px; margin-bottom:25px;">
  <p style="margin: 12px 0 8px; font-size:14px; color:#555555;">
  <strong style="color:#111111;">Payment Method:</strong>
  ${
    paymentMethod === "instapay"
      ? "Instapay"
      : "Cash on Delivery"
  }
</p>
</div>

  <!-- Order Items -->
  <p style="margin:0 0 10px; font-size:14px; font-weight:bold; color:#111111;">
    Order Items
  </p>

  <div style="background:#fafafa; border-radius:10px; padding:18px; margin-bottom:25px;">
    ${items}
  </div>

  <!-- Totals -->

  <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:14px; color:#555555;">
    <span>Subtotal: </span>
    <span>${subtotal} LE</span>
  </div>

  ${
          promoCode && promoDiscount > 0
            ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span style="color:#16803c;">
                  Promo (${promoCode})
                </span>

                <span style="color:#16803c;">
                  - LE ${promoDiscount}
                </span>
              </div>
            `
            : ""
        }

    <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px; color:#555555;">
  <span>Shipping: </span>

  ${
    freeShipping
      ? `<span style="color:#16803c; font-weight:bold;">Free</span>`
      : `<span>${shipping} LE</span>`
  }
</div>

  <div style="display:flex; justify-content:space-between; padding-top:15px; border-top:1px solid #eeeeee; font-size:16px; font-weight:bold; color:#111111;">
    <span>Total: </span>
    <span>${total} LE</span>
  </div>


</div>

<!-- Footer -->
<div style="border-top:1px solid #eeeeee; padding:20px 30px; text-align:center;">

  <p style="margin:0; color:#999999; font-size:12px;">
    Thank you for shopping with KAPATO.
  </p>

  <p style="margin:8px 0 0; color:#999999; font-size:12px;">
    © 2026 KAPATO. All rights reserved.
  </p>

</div>


  </div>

</body>
</html>
`;

module.exports = orderCustomerEmailTemplate;
