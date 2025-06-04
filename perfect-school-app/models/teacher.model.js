const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String },
  class: { type: String },
  subject: { type: String, required: true, default: "All" },
  phone: { type: String, required: true },
  teacherCode: { type: String, required: true, unique: true },
  status: { type: String, default: "pending" }, // pending means they have not accepted the invitation, active means they have, inactive means they have been removed/deactivated
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  qualification: { type: String },
  yearsOfExperience: { type: Number },
  invitationExpiresAt: { type: Date },
  otp: { type: String },
  otpExpiry: { type: Date },
});

module.exports = mongoose.model("Teacher", teacherSchema);
