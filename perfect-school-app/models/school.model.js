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
});

module.exports = mongoose.model("school", SchoolSchema);
