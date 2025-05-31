const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  phone: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  parents: [{ type: mongoose.Schema.ObjectId, ref: "Parents", required: true }],
});

module.exports = mongoose.model("Student", studentSchema);
