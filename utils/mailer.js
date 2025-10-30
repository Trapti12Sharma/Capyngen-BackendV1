require("dotenv").config();
const sgMail = require("@sendgrid/mail");

// set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * sendMail - sends an email via SendGrid API.
 * Automatically uses COMPANY_EMAIL as recipient if 'to' not provided.
 */
async function sendMail({ to, subject, html, text, replyTo }) {
  const displayName = process.env.MAIL_FROM_NAME || "Capyngen";
  const fromAddress = process.env.SMTP_FROM || process.env.COMPANY_EMAIL;
  const recipient = to || process.env.COMPANY_EMAIL; // ✅ fallback to COMPANY_EMAIL

  const msg = {
    to: recipient,
    from: {
      email: fromAddress,
      name: displayName,
    },
    subject,
    text,
    html,
  };

  if (replyTo) msg.replyTo = replyTo;

  console.log("📧 Sending mail with SendGrid:", {
    from: msg.from,
    to: msg.to,
    subject: msg.subject,
  });

  try {
    const [response] = await sgMail.send(msg);
    console.log("✅ Mail sent:", response.statusCode);
    return { ok: true, status: response.statusCode };
  } catch (err) {
    console.error("❌ SendGrid error:", err.response?.body || err.message);
    throw err;
  }
}

module.exports = { sendMail };
