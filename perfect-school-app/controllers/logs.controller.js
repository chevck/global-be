const logsModel = require("../models/logs.model");

module.exports = {
  create: async (body) => {
    try {
      const log = new logsModel(body);
      await log.save();
    } catch (error) {
      console.log("error", error);
    }
  },

  get: async (req, res) => {
    try {
      const logs = await logsModel
        .find({ schoolId: req.user.id })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
      res.status(200).json({ logs });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
