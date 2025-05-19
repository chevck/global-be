const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  role: { type: String, unique: true, required: true },
  title: { type: String, unique: true, required: true },
  created_at: { type: Date, default: new Date() },
});

module.exports = mongoose.model("roles", RoleSchema);
