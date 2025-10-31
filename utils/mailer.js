require("dotenv").config();
const nodemailer = require("nodemailer");

// Single transporter reused across sends
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtpout.secureserver.net
  port: Number(process.env.SMTP_PORT || 465), // 465 or 587
  secure: String(process.env.SMTP_SECURE) === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // full email
    pass: process.env.SMTP_PASS, // mailbox password
  },
});

/**
 * sendMail - sends an email via GoDaddy SMTP.
 * Automatically uses COMPANY_EMAIL as recipient if 'to' not provided.
 */
async function sendMail({ to, subject, html, text, replyTo }) {
  const displayName = process.env.MAIL_FROM_NAME || "Capyngen";
  const fromAddress = process.env.SMTP_FROM || process.env.COMPANY_EMAIL;
  const recipient = to || process.env.COMPANY_EMAIL;

  const mailOptions = {
    from: { name: displayName, address: fromAddress },
    to: recipient,
    subject,
    text,
    html,
    ...(replyTo ? { replyTo } : {}),
  };

  console.log("📧 Sending mail via SMTP:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Mail sent:", info.messageId);
    return { ok: true, id: info.messageId };
  } catch (err) {
    console.error("❌ SMTP error:", err?.response || err?.message || err);
    throw err;
  }
}

module.exports = { sendMail };
