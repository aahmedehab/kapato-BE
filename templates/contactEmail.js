const contactEmailTemplate = ({
name,
email,
subject,
message,
}) => `

<!DOCTYPE html>

<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
</head>

<body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">

  <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:16px; overflow:hidden;">


<!-- Header -->
<div style="background:#111111; padding:28px 30px; text-align:center;">
  <h1 style="margin:0; color:#ffffff; font-size:26px; letter-spacing:2px;">
    KAPATO
  </h1>

  <p style="margin:8px 0 0; color:#cccccc; font-size:13px;">
    New Contact Message
  </p>
</div>

<!-- Content -->
<div style="padding:30px;">

  <h2 style="margin:0 0 25px; color:#111111; font-size:20px;">
    You received a new message
  </h2>

  <!-- Customer Info -->
  <div style="background:#f8f8f8; border-radius:12px; padding:20px; margin-bottom:25px;">

    <p style="margin:0 0 12px; font-size:14px; color:#555555;">
      <strong style="color:#111111;">Name:</strong>
      ${name}
    </p>

    <p style="margin:0 0 12px; font-size:14px; color:#555555;">
      <strong style="color:#111111;">Email:</strong>
      ${email}
    </p>

    <p style="margin:0; font-size:14px; color:#555555;">
      <strong style="color:#111111;">Subject:</strong>
      ${subject}
    </p>

  </div>

  <!-- Message -->
  <p style="margin:0 0 10px; font-size:14px; font-weight:bold; color:#111111;">
    Message
  </p>

  <div style="background:#fafafa; border-left:4px solid #111111; padding:18px; border-radius:8px; margin-bottom:30px;">
    <p style="margin:0; color:#444444; font-size:14px; line-height:1.7; white-space:pre-wrap;">
      ${message}
    </p>
  </div>

  <!-- Reply -->
  <div style="text-align:center;">
    <a
      href="mailto:${email}"
      style="display:inline-block; background:#111111; color:#ffffff; text-decoration:none; padding:13px 24px; border-radius:8px; font-size:14px; font-weight:bold;"
    >
      Reply to ${name}
    </a>
  </div>

</div>

<!-- Footer -->
<div style="border-top:1px solid #eeeeee; padding:20px 30px; text-align:center;">

  <p style="margin:0; color:#999999; font-size:12px;">
    This message was sent from the KAPATO website contact form.
  </p>

  <p style="margin:8px 0 0; color:#999999; font-size:12px;">
    © 2026 KAPATO. All rights reserved.
  </p>

</div>


  </div>

</body>
</html>
`
;

module.exports = contactEmailTemplate;
