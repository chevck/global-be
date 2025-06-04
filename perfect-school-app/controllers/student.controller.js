const mongoose = require("mongoose");
const studentModel = require("../models/student.model");

module.exports = {
  create: async (req, res) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const body = {
        schoolId: req.user.id,
        name: req.body.firstName + " " + req.body.lastName,
        email: req.body.studentEmail ?? "",
        dob: req.body.dateOfBirth,
        gender: req.body.gender,
        teacherId: req.body.teacher,
        password: req.body.password,
        class: req.body.class,
        joinDate: req.body.joinDate,
        address: req.body.address,
        admissionNumber: req.body.admissionNumber,
      };
      if (req.body.parent) {
        body.parents = [req.body.parent];
      }
      const student = await studentModel.create(body);
      await session.commitTransaction();
      session.endSession();
      res
        .status(201)
        .json({ message: "Student created successfully", student });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
