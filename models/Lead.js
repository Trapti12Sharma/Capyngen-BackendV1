const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  brandName: { type: String, required: true },
  website: { type: String, required: true },
  businessType: { type: String, required: true },
  services: { type: [String], required: true },
  budget: { type: String, required: true },
  bestTime: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
