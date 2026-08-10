const transporter = require("../config/mailer");
const contactEmailTemplate = require("../templates/contactEmail");

const sendContactMessage = async (req, res) => {
try {
const {
name,
email,
subject,
message,
} = req.body;


if (!name || !email || !subject || !message) {
  return res.status(400).json({
    success: false,
    message: "Name, email, subject and message are required",
  });
}

const info = await transporter.sendMail({
  from: {
    name: "KAPATO",
    address: process.env.MAIL_FROM,
  },
  to: process.env.MAIL_TO,
  replyTo: email,
  subject: `New Contact Message from ${name}`,
  html: contactEmailTemplate({
    name,
    email,
    subject,
    message,
  }),
});

console.log("✅ Email sent:", info.messageId);
console.log("📧 Accepted:", info.accepted);
console.log("📧 Rejected:", info.rejected);

res.status(200).json({
  success: true,
  message: "Message sent successfully",
});


} catch (error) {
console.error("❌ Contact email error:", error);


res.status(500).json({
  success: false,
  message: "Failed to send message",
});


}
};

module.exports = {
sendContactMessage,
};
