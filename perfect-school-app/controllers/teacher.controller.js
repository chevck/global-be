const teacherModel = require("../models/teacher.model");
const schoolModel = require("../models/school.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const {
  generateNumericCode,
  formatDate,
  sendTeacherInviteEmail,
  sendOTPEmail,
} = require("../utils");

module.exports = {
  create: async (req, res) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const teacherCode =
        "TCH-" + new Date().getFullYear() + "-" + generateNumericCode(5);
      const school = await schoolModel.findById(req.user.id);
      const body = {
        schoolId: req.user.id,
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        phone: req.body.phone,
        class: req.body.class,
        teacherCode,
        invitationExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      };
      const teacher = await teacherModel.create(body);

      const accessToken = jwt.sign(
        { teacherId: teacher._id.toString() },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      const registrationUrl = `${process.env.FRONTEND_APP_BASE_URL}/complete-teacher-registration/${teacherCode}?accessToken=${accessToken}`;
      await sendTeacherInviteEmail({
        teacherEmail: body.email,
        schoolName: school.schoolName,
        teacherCode,
        invitationExpiresAt: formatDate(body.invitationExpiresAt),
        registrationUrl,
      });
      await session.commitTransaction();
      session.endSession();
      res
        .status(201)
        .json({ message: "Teacher created successfully", teacher });
    } catch (error) {
      console.log("error", error);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: "Internal server error" });
    }
  },

  login: async (req, res) => {
    try {
      const teacher = await teacherModel.findOne({ email: req.body.email });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        teacher.password
      );
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid password" });
      }
      const otpCode = generateNumericCode();
      teacherModel.db.collection("teachers").updateOne(
        { _id: teacher._id },
        {
          $set: {
            otp: otpCode,
            otpExpiry: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
          },
        }
      );
      await sendOTPEmail({
        email: teacher.email,
        otp: otpCode,
        otpExpiry: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
      });
      res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  confirmOTP: async (req, res) => {
    try {
      const teacher = await teacherModel.findOne({ email: req.body.email });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      if (teacher.otpExpiry < new Date()) {
        return res.status(400).json({ message: "OTP expired" });
      }
      if (teacher.otp !== req.body.otp) {
        return res.status(401).json({ message: "Invalid OTP" });
      }
      await teacherModel.db
        .collection("teachers")
        .updateOne(
          { _id: teacher._id },
          { $unset: { otp: "", otpExpiry: "" } }
        );
      const school = await schoolModel.findById(teacher.schoolId);
      const token = jwt.sign(
        {
          id: school._id,
          email: school.adminEmail,
          teacherId: teacher._id.toString(),
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      res.status(200).json({
        message: "OTP verified",
        token,
        email: school.adminEmail,
        schoolName: school.schoolName,
        logoUrl: school.logoUrl,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        schoolId: school._id.toString(),
        teacherId: teacher._id.toString(),
        address: school.address,
        role: "teacher",
        class: teacher.class,
      });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getAll: async (req, res) => {
    try {
      const teachers = await teacherModel.find({ schoolId: req.user.id });
      res.status(200).json({ teachers });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  delete: async (req, res) => {
    try {
      const teacher = await teacherModel.findById(req.params.id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      await teacherModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Teacher deleted successfully" });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getByTeacherCode: async (req, res) => {
    try {
      const teacher = await teacherModel.findOne({
        teacherCode: req.params.teacherCode,
      });
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      if (teacher.status !== "pending") {
        return res.status(400).json({
          message:
            "Teacher is not pending. You can go ahead to login to your account",
        });
      }
      if (teacher.invitationExpiresAt < new Date()) {
        return res.status(400).json({ message: "Invitation expired" });
      }
      res.status(200).json({ teacher });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  completeTeacherRegistration: async (req, res) => {
    try {
      const teacher = await teacherModel.findById(req.user.teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      if (teacher.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Teacher has already completed registration" });
      }
      if (teacher.invitationExpiresAt < new Date()) {
        return res.status(400).json({ message: "Invitation expired" });
      }
      teacher.status = "active";
      teacher.invitationExpiresAt = null;
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      teacher.password = hashedPassword;
      teacher.qualification = req.body.qualification;
      teacher.yearsOfExperience = req.body.yearsOfExperience;
      await teacher.save();
      res.status(200).json({ message: "Teacher registration completed" });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  update: async (req, res) => {
    try {
      const teacher = await teacherModel.findById(req.params.id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      await teacherModel.findByIdAndUpdate(req.params.id, req.body);
      res.status(200).json({ message: "Teacher updated successfully" });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
