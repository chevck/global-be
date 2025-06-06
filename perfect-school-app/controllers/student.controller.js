const mongoose = require("mongoose");
const studentModel = require("../models/student.model");
const { formatNumberToThreeDigits } = require("../utils");
const logsController = require("./logs.controller");

module.exports = {
  create: async (req, res) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const studentsCount = await studentModel.countDocuments();
      const body = {
        schoolId: req.user.id,
        name: req.body.firstName + " " + req.body.lastName,
        email: req.body.studentEmail ?? "",
        dob: req.body.dateOfBirth,
        gender: req.body.gender,
        teacherId: req.body.teacherId,
        class: req.body.class,
        joinDate: req.body.joinDate,
        address: req.body.address,
        admissionNumber: req.body.admissionNumber,
        studentId: `PSA-STU-${formatNumberToThreeDigits(studentsCount + 1)}`,
        status: "pending",
      };
      // if (req.body.parent) {
      //   body.parents = [req.body.parent];
      // }
      const student = await studentModel.create(body);
      await session.commitTransaction();
      session.endSession();
      logsController.create({
        action: `New student ${student.name} has been registered`,
        actionType: "create",
        schoolId: req.user.id,
        createdBy: req.user?.teacherId ? req.user.teacherId : req.user.id, // if teacher is creating the student, then the createdBy is the teacher id, otherwise it is the school id
        createdAt: new Date(),
        model_type: req.user?.teacherId ? "Teacher" : "School",
      });
      res
        .status(201)
        .json({ message: "Student created successfully", student });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: "Internal server error" });
    }
  },
  get: async (req, res) => {
    const query = {};
    if (req.query.class) query.class = req.query.class;
    if (req.query.status) query.status = req.query.status;
    if (req.query.searchTerm) {
      query.$or = [
        { name: { $regex: req.query.searchTerm, $options: "i" } },
        { email: { $regex: req.query.searchTerm, $options: "i" } },
      ];
    }
    try {
      const students = await studentModel
        .find({ schoolId: req.user.id, ...query })
        .populate("teacherId");
      // .populate("parents");
      res.status(200).json({ students });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  edit: async (req, res) => {
    try {
      const student = await studentModel
        .findByIdAndUpdate(req.params.id, req.body, {
          new: true,
        })
        .populate("teacherId");
      logsController.create({
        action: `Student ${student.name} has been updated`,
        actionType: "update",
        schoolId: req.user.id,
        createdBy: req.user?.teacherId ? req.user.teacherId : req.user.id,
        createdAt: new Date(),
        model_type: req.user?.teacherId ? "Teacher" : "School",
      });
      res
        .status(200)
        .json({ message: "Student updated successfully", student });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  delete: async (req, res) => {
    try {
      const student = await studentModel.findByIdAndDelete(req.params.id);
      logsController.create({
        action: `Student ${student.name} has been deleted`,
        actionType: "delete",
        schoolId: req.user.id,
        createdBy: req.user?.teacherId ? req.user.teacherId : req.user.id,
        createdAt: new Date(),
        model_type: req.user?.teacherId ? "Teacher" : "School",
      });
      res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
