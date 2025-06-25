const mongoose = require("mongoose");

const examQuestionSchema = {
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: String, required: true },
  correctOptionIndex: { type: Number, required: true },
  marks: { type: Number, required: true },
};

const studentsThatHaveStartedTheExams = {
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  status: { type: String, enum: ["in-progress", "completed"] },
  score: { type: Number },
};

const examinationSchema = new mongoose.Schema({
  class: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  subject: { type: String, required: true },
  term: { type: String, required: true },
  session: { type: String, required: true },
  duration: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  instructions: { type: String },
  examQuestions: [examQuestionSchema],
  createdAt: { type: Date, default: new Date() },
  examDate: { type: Date, default: new Date() },
  isReviewed: { type: Boolean, default: false },
  students: [studentsThatHaveStartedTheExams],
  updatedAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Examinations", examinationSchema);
