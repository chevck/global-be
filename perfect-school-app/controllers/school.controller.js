const schoolModel = require("../models/school.model");
const {
  sendRegisterEmail,
  generateNumericCode,
  sendOTPEmail,
} = require("../utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const studentModel = require("../models/student.model");
const teacherModel = require("../models/teacher.model");
const logsModel = require("../models/logs.model");

module.exports = {
  register: async (req, res) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const hashedPassword = await bcrypt.hash(req.body.adminPassword, 10);
      let school = new schoolModel({
        ...req.body,
        registrationId: `PSA-${generateNumericCode()}`,
        adminPassword: hashedPassword,
      });
      school = await school.save();
      await sendRegisterEmail({
        ...req.body,
        registrationId: school.registrationId,
      });
      return res.status(201).json({ ...school._doc });
    } catch (error) {
      await session.abortTransaction();
      return res.status(500).json({
        message:
          "Failed to create this school right now. Please try again later",
        error,
      });
    } finally {
      await session.endSession();
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const school = await schoolModel.findOne({ adminEmail: email });
      if (!school) {
        return res.status(401).json({
          message:
            "This email is not registered to a school. Please use the right email or contact support",
        });
      }
      const isPasswordValid = await bcrypt.compare(
        password,
        school.adminPassword
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
      const otpCode = generateNumericCode();
      schoolModel.db.collection("schools").updateOne(
        { _id: school._id },
        {
          $set: {
            otp: otpCode,
            otpExpiry: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
          },
        }
      );
      await sendOTPEmail({
        email: email,
        otp: otpCode,
      });
      return res.status(200).json({
        message: "OTP sent to your email",
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        message: "Failed to login",
        error,
      });
    }
  },

  verifyEmailOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const school = await schoolModel.findOne({ adminEmail: email });
      if (!school) {
        return res.status(401).json({
          message:
            "This email is not registered to a school. Please use the right email or contact support",
        });
      }
      if (school.otp !== otp) {
        return res.status(401).json({
          message: "Invalid OTP",
        });
      }
      if (school.otpExpiry < new Date()) {
        return res.status(401).json({
          message: "OTP expired",
        });
      }
      await schoolModel.db
        .collection("schools")
        .updateOne({ _id: school._id }, { $unset: { otp: "", otpExpiry: "" } });
      const token = jwt.sign(
        {
          id: school._id,
          email: school.adminEmail,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      return res.status(200).json({
        message: "OTP verified",
        token,
        email: school.adminEmail,
        schoolName: school.schoolName,
        logoUrl: school.logoUrl,
        role: "admin",
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        message: "Failed to verify OTP. Please try again later",
        error,
      });
    }
  },

  dashboard: async (req, res) => {
    try {
      const school = await schoolModel.findById(req.user.id);
      if (!school) {
        return res.status(401).json({
          message: "School not found",
        });
      }
      const totalStudents = await studentModel.countDocuments({
        schoolId: school._id,
      });
      const totalTeachers = await teacherModel.countDocuments({
        schoolId: school._id,
      });
      const logs = await logsModel
        .find({ schoolId: school._id })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .limit(10);
      res.status(200).json({
        totalStudents,
        totalTeachers,
        logs,
      });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
