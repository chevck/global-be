const schoolModel = require("../models/school.model");
const { Resend } = require("resend");
const { sendRegisterEmail } = require("../utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  register: async (req, res) => {
    try {
      let school = new schoolModel(req.body);
      school = await school.save();
      await sendRegisterEmail({
        ...req.body,
        password: await bcrypt.hash(req.body.password, 10),
      });
      return res.status(201).json({ ...school._doc });
    } catch (error) {
      console.log("ereoe", error);
      return res.status(500).json({
        message:
          "Failed to create this school right now. Please try again later",
        error,
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const school = await schoolModel.findOne({ email });
      if (!school) {
        return res.status(401).json({ message: "School not found" });
      }
      const isPasswordValid = await bcrypt.compare(password, school.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
      const token = jwt.sign(
        { id: school._id, email: school.email, name: school.name },
        process.env.JWT_SECRET
      );
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to login",
        error,
      });
    }
  },
};
