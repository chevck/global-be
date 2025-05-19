const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SchoolSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  logo: { type: String },
  created_at: { type: Date, default: new Date() },
});
