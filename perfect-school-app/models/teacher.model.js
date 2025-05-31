const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  class: { type: String },
  subject: { type: String, required: true, default: "All" },
  phone: { type: String, required: true },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  qualification: { type: String },
  experience: { type: Number },
});

module.exports = mongoose.model("Teacher", teacherSchema);
