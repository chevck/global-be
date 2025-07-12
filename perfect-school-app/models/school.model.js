const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SchoolSchema = new Schema({
  adminName: { type: String, required: true },
  schoolEmail: { type: String, unique: true },
  schoolName: { type: String, unique: true },
  schoolThemeColor: { type: String },
  adminEmail: { type: String, required: true },
  adminPassword: { type: String, required: true },
  logoUrl: { type: String },
  created_at: { type: Date, default: new Date() },
  registrationId: { type: String, required: true, unique: true },
  otp: { type: String },
  otpExpiry: { type: Date },
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: new Date() },
  address: { type: String, required: true },
  currency: { type: String },
  schoolBankAccounts: [
    {
      bankName: String,
      accountNumber: String,
      accountName: String,
      accountType: String,
      isPrimary: Boolean,
    },
  ],
  subjects: [{ type: String, _id: false }],
  classes: [{ type: String, _id: false }],
});

module.exports = mongoose.model("School", SchoolSchema);
