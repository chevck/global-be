const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subjectSchema = new Schema(
  {
    name: { type: String, unique: false },
    description: String,
  },
  { _id: false },
);

const classSchema = new Schema(
  {
    className: { type: String, unique: false },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  },
  { _id: false },
);

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
      bankName: { type: String, trim: true, lowercase: true },
      accountNumber: { type: String, trim: true },
      accountName: String,
      accountType: String,
      isPrimary: Boolean,
    },
  ],
  subjects: {
    type: [subjectSchema],
    // NOTE: Keep empty by default to avoid duplicate-key errors if a stale
    // unique index on `subjects.name` exists in the database.
    default: [],
  },
  classes: {
    type: [classSchema],
  },
});

// Enforce: no two schools can share the same (bankName, accountNumber) pair,
// and a single school can't add the same pair twice.
SchoolSchema.index(
  { "schoolBankAccounts.bankName": 1, "schoolBankAccounts.accountNumber": 1 },
  {
    unique: true,
    name: "uniq_school_bank_account_pair",
    partialFilterExpression: {
      "schoolBankAccounts.bankName": { $type: "string", $ne: "" },
      "schoolBankAccounts.accountNumber": { $type: "string", $ne: "" },
    },
  },
);

module.exports = mongoose.model("School", SchoolSchema);
