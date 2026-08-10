const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Gmail connection failed:", error);
  } else {
    console.log("✅ Gmail SMTP is ready");
  }
});

module.exports = transporter;

transporter.verify((error) => {
  if (error) {
    console.error("❌ Gmail connection failed:", error);
  } else {
    console.log("✅ Gmail SMTP is ready");
  }
});

module.exports = transporter;