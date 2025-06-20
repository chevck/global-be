const mongoose = require("mongoose");
const examinationModel = require("../models/examination.model");
const logsController = require("./logs.controller");
const studentModel = require("../models/student.model");

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
      const exam = await examinationModel.create(body);
      await session.commitTransaction();
      session.endSession();
      logsController.create(req, {
        action: `${body.subject} exam created by ${body.teacher} for ${body.academicSession} - ${body.term}`,
        actionType: "create",
      });
      res.status(201).json({ message: "Exam created!", exam });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getAll: async (req, res) => {
    try {
      const query = {};
      if (req.query.subject) query.subject = req.query.subject;
      if (req.query.class) query.class = req.query.class;
      if (req.query.status) query.status = req.query.status;
      if (req.query.term) query.term = req.query.term;

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
    console.log("sds", req.params);
    try {
      const examDoc = await examinationModel.findOne({
        _id: req.params.id,
      });
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
      console.log("sdss", req.body);
      let examDoc = await examinationModel.findOne({
        _id: req.body.examId,
        schoolId: req.user.id,
      });
      if (!examDoc)
        return res.status(404).json({
          message:
            "This examination is invalid. It does not exist. Contact support",
        });
      console.log("updating ex", examDoc);
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
      console.log("bodu", req.body);
      const exam = await examinationModel.findById(req.body.examId);
      if (!exam)
        return res
          .status(404)
          .json({ message: "This exam does not exist in our record" });
      console.log({ exam });
      const student = await studentModel.findOne({
        schoolId: exam.schoolId,
        studentId: req.body.studentId,
      });
      console.log({ student });

      if (!student)
        return res.status(404).json({
          message: "Invalid Student Id. We could not find this student",
        });
      // check if student has signed in to take the exam, if they have not
      //  - log them on the examination body as studentsTakenTheExam:[StudentIds]
      // if they have, check their statuus to see if they have completed the exam or not and return data based on that.
      return res.status(200).json({ student, exam });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
