const express = require("express");
const { body, validationResult } = require("express-validator");
const { sendMail } = require("../utils/mailer");
const Lead = require("../models/Lead.js");
const router = express.Router();

// helper to safely render HTML
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * POST /api/lead
 * Accepts lead data from frontend (all dropdown options are dynamic)
 */
router.post(
  "/",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").optional().isEmail().withMessage("Invalid email"),
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("brandName").trim().notEmpty().withMessage("Brand name is required"),
    body("website")
      .trim()
      .notEmpty()
      .withMessage("Website or 'No Website' required"),
    // dynamic dropdown values: we only check they exist, not what they contain
    body("businessType")
      .trim()
      .notEmpty()
      .withMessage("Business type is required"),
    body("services")
      .isArray({ min: 1 })
      .withMessage("At least one service must be selected"),
    body("budget").trim().notEmpty().withMessage("Budget is required"),
    body("bestTime")
      .trim()
      .notEmpty()
      .withMessage("Best time to call is required"),
    body("notes").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ ok: false, errors: errors.array() });

    // Destructure all form fields
    const {
      fullName,
      email,
      phone,
      city,
      brandName,
      website,
      businessType,
      services,
      budget,
      bestTime,
      notes,
    } = req.body;

    const sentAt = new Date().toLocaleString();

    // Create email HTML
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;">
        <h2 style="color:#0b66c3;">📩 New Marketing Lead</h2>
        <table style="border-collapse:collapse;">
          <tr><td><b>Full Name:</b></td><td>${escapeHtml(fullName)}</td></tr>
          ${
            email
              ? `<tr><td><b>Email:</b></td><td>${escapeHtml(email)}</td></tr>`
              : ""
          }
          <tr><td><b>Phone / WhatsApp:</b></td><td>${escapeHtml(
            phone
          )}</td></tr>
          <tr><td><b>City / Location:</b></td><td>${escapeHtml(city)}</td></tr>
          <tr><td><b>Business / Brand Name:</b></td><td>${escapeHtml(
            brandName
          )}</td></tr>
          <tr><td><b>Website:</b></td><td>${escapeHtml(website)}</td></tr>
          <tr><td><b>Business Type:</b></td><td>${escapeHtml(
            businessType
          )}</td></tr>
          <tr><td><b>Services:</b></td><td>${escapeHtml(
            services.join(", ")
          )}</td></tr>
          <tr><td><b>Monthly Budget:</b></td><td>${escapeHtml(budget)}</td></tr>
          <tr><td><b>Best Time To Call:</b></td><td>${escapeHtml(
            bestTime
          )}</td></tr>
          ${
            notes
              ? `<tr><td><b>Additional Notes:</b></td><td>${escapeHtml(
                  notes
                )}</td></tr>`
              : ""
          }
        </table>
        <hr/>
        <p style="color:#666;font-size:12px;">Sent on ${sentAt}</p>
      </div>`;

    const text = `
New Lead Submission:

Full Name: ${fullName}
Email: ${email || "-"}
Phone: ${phone}
City: ${city}
Brand: ${brandName}
Website: ${website}
Business Type: ${businessType}
Services: ${services.join(", ")}
Budget: ${budget}
Best Time To Call: ${bestTime}
Notes: ${notes || "-"}
Sent: ${sentAt}
`;

    try {
      const lead = new Lead({
        fullName,
        email,
        phone,
        city,
        brandName,
        website,
        businessType,
        services,
        budget,
        bestTime,
        notes,
      });

      await lead.save();

      await sendMail({
        to: email,
        subject: `[Lead] ${fullName} - ${businessType}`,
        html,
        text,
        replyTo: email || undefined, // optional reply-to
      });

      return res.json({ ok: true, message: "Mail sent successfully ✅" });
    } catch (err) {
      console.error("Mail error:", err);
      return res.status(500).json({
        ok: false,
        message: "Failed to send email",
        error: err.message,
      });
    }
  }
);

module.exports = router;
