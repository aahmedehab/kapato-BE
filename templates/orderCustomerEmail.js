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
  total,
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Order Confirmation</title>
</head>

<body style="margin:0; padding:0; background:#f5f5f5; font-family:Arial,sans-serif;">

  <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:16px; overflow:hidden;">

    <div style="padding:25px; border-bottom:1px solid #eeeeee;">
      <h1 style="margin:0; font-size:24px; color:#111111;">
        KAPATO
      </h1>

      <p style="margin:8px 0 0; color:#666666;">
        Order Confirmation #${orderId}
      </p>
    </div>

    <div style="padding:25px;">

      <p style="font-size:16px; color:#111111;">
        Hi ${customerName},
      </p>

      <p style="color:#555555;">
        Thank you for your order. We've received it successfully.
      </p>

      <h3 style="margin-top:25px; color:#111111;">
        Order Items
      </h3>

      ${items}

      <div style="border-top:1px solid #eeeeee; margin-top:20px; padding-top:20px;">

        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <span style="color:#555555;">
            Subtotal
          </span>

          <span style="color:#111111;">
            LE ${subtotal}
          </span>
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

        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <span style="color:#555555;">
            Shipping
          </span>

          <span style="color:#111111;">
            LE ${shipping}
          </span>
        </div>

        <div style="display:flex; justify-content:space-between; padding-top:15px; border-top:1px solid #eeeeee;">
          <strong style="font-size:18px; color:#111111;">
            Total
          </strong>

          <strong style="font-size:18px; color:#111111;">
            LE ${total}
          </strong>
        </div>

      </div>

    </div>

  </div>

</body>
</html>
`;
};

module.exports = orderCustomerEmailTemplate;