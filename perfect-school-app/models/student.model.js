const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String },
  dob: { type: Date },
  password: { type: String },
  gender: { type: String },
  phone: { type: String },
  address: { type: String },
  class: { type: String, required: true },
  joinDate: { type: Date, required: true },
  admissionNumber: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  status: { type: String, default: "pending" },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  parents: [{ type: mongoose.Schema.ObjectId, ref: "Parents" }],
  bills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bill" }],
  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Student", studentSchema);
