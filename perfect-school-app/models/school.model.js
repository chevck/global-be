const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subjectSchema = new Schema(
  {
    name: String,
    description: String,
  },
  { _id: false }
);

const classSchema = new Schema(
  {
    className: String,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  },
  { _id: false }
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
      bankName: String,
      accountNumber: String,
      accountName: String,
      accountType: String,
      isPrimary: Boolean,
    },
  ],
  subjects: {
    type: [subjectSchema],
    default: [{ name: "Mathematics" }, { name: "English" }],
  },
  classes: {
    type: [classSchema],
  },
});

module.exports = mongoose.model("School", SchoolSchema);
