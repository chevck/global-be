const mongoose = require("mongoose");
const examinationModel = require("../models/examination.model");
const logsController = require("./logs.controller");
const studentModel = require("../models/student.model");
const jwt = require("jsonwebtoken");
const { nonAuthActionReasons } = require("../utils");

module.exports = {
  create: async (req, res) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const body = {
        ...req.body,
        createdBy: req.body.teacher,
        session: req.body.academicSession,
        examDate: req.body.examinationDate,
        schoolId: req.user.id,
      };
      let exam = await examinationModel.create(body);
      exam = await exam.populate("createdBy");
      await session.commitTransaction();
      session.endSession();
      logsController.create(req, {
        action: `${body.subject} exam created by ${body.teacher} for ${body.academicSession} - ${body.term}`,
        actionType: "create",
      });
      res.status(201).json({ message: "Exam created!", exam });
    } catch (error) {
      console.log("ere", error);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: "Internal server error" });
    }
  },
  update: async (req, res) => {
    try {
      const { examId } = req.params;
      const exam = await examinationModel.findOne({ _id: examId });
      if (!exam)
        return res.status(400).json({
          message: "We could not find your exam. Please contact support",
        });
      const response = await examinationModel.findByIdAndUpdate(
        { _id: examId },
        { ...req.body },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Examination has been updated", response });
    } catch (error) {
      console.log("updating examination", error);
      res.status(500).json({
        message:
          "There was an error updating examination. Please try again later",
      });
    }
  },
  getAll: async (req, res) => {
    try {
      const { subject, class: schoolClass, status, term } = req.query;
      const query = {};
      if (subject) query.subject = subject;
      if (schoolClass) query.class = schoolClass;
      if (status === "pending") query.isReviewed = false;
      if (status === "reviewed") query.isReviewed = true;
      if (term) query.term = term;

      const exams = await examinationModel
        .find({
          schoolId: req.user.id,
          ...query,
        })
        .populate("createdBy schoolId");
      return res.status(200).json({ exams });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({
        message: "Failed to get all examinations",
        error,
      });
    }
  },
  getExam: async (req, res) => {
    try {
      const examDoc = await examinationModel
        .findOne({
          _id: req.params.examId,
        })
        .populate("createdBy");
      if (!examDoc)
        return res
          .status(404)
          .json({ message: "This exam does not exist in our records" });
      return res.status(200).json({ exam: examDoc });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  saveExaminationQuestions: async (req, res) => {
    try {
      let examDoc = await examinationModel.findOne({
        _id: req.body.examId,
        schoolId: req.user.id,
      });
      if (!examDoc)
        return res.status(404).json({
          message:
            "This examination is invalid. It does not exist. Contact support",
        });
      await examinationModel.findOneAndUpdate(
        { _id: examDoc._id },
        { examQuestions: req.body.questions },
        {
          new: true,
        }
      );
      return res.status(200).json({ message: "Updated exams successfully" });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  loginStudent: async (req, res) => {
    try {
      const { examId, studentId } = req.body;
      const exam = await examinationModel.findById(examId);
      if (!exam)
        return res
          .status(404)
          .json({ message: "This exam does not exist in our record" });

      const student = await studentModel.findOne({
        schoolId: exam.schoolId,
        studentId,
      });

      if (!student)
        return res.status(404).json({
          message: "Invalid Student Id. We could not find this student",
        });

      const examStudent = exam.students.find(
        (eStudent) => eStudent.studentId.toString() === student._id.toString()
      );

      if (!examStudent) {
        // create a student only when the student is not found
        await examinationModel.findOneAndUpdate(
          { _id: exam._id },
          {
            $addToSet: {
              students: {
                studentId: student._id,
                status: "in-progress",
              },
            },
          },
          { new: true }
        );
      }

      if (examStudent && examStudent.status === "completed")
        return res.status(400).json({
          message:
            "You have completed your exams! Please inform your teacher if there is an issue",
        });

      const authToken = jwt.sign(
        {
          studentId,
          action: nonAuthActionReasons.STUDENT_EXAM_LOGIN,
        },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
      );
      return res.status(200).json({ student, exam, authToken });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  submitExam: async (req, res) => {
    try {
      const { examId } = req.params;
      const { studentId, score, schoolId } = req.body;
      // Find the exam and ensure the student exists in the array
      const exam = await examinationModel.findOne({
        _id: examId,
        schoolId,
        "students.studentId": studentId,
      });

      if (!exam) {
        return res.status(404).json({ message: "Exam or student not found" });
      }
      // Update the student's status and score atomically
      await examinationModel.updateOne(
        { _id: examId, "students.studentId": studentId },
        {
          $set: {
            "students.$.status": "completed",
            "students.$.score": score,
          },
        }
      );
      return res.status(200).json({ message: "Exam submitted successfully" });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({
        message:
          "Failed to submit this exam successfully. Please contact support",
      });
    }
  },
  deleteExam: async (req, res) => {
    try {
      const examDoc = await examinationModel.findOne({
        _id: req.params.examId,
      });
      if (!examDoc)
        return res.status(404).json({
          message:
            "Examination document does not exist. Please contact support",
        });
      await examinationModel.deleteOne({ _id: req.params.examId });
      return res.status(200).json({ message: "Exam Deleted Successfully!" });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({
        message: "Failed to delete this exam. Please contact support",
      });
    }
  },
};
