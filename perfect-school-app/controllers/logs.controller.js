const logsModel = require("../models/logs.model");

module.exports = {
  // create: async (body) => {
  //   try {
  //     if (!body.action || !body.actionType || !body.schoolId) {
  //       throw new Error(
  //         "Missing required fields: action, actionType, and schoolId are required"
  //       );
  //     }
  //     const log = new logsModel(body);
  //     await log.save();
  //   } catch (error) {
  //     console.error("Error creating log:", error);
  //     throw new Error(
  //       "There was an issue creating a log for this operation. Please try again!"
  //     );
  //   }
  // },

  create: async (req, body) => {
    try {
      if (!body.action) {
        throw new Error("Action is required for logging");
      }
      if (!body.actionType) {
        throw new Error("Action type is required for logging");
      }
      const logData = {
        ...body,
        schoolId: req.user.id,
        createdBy: req.user?.teacherId ? req.user.teacherId : req.user.id,
        createdAt: new Date(),
        model_type: req.user?.teacherId ? "Teacher" : "School",
      };
      const log = new logsModel(logData);
      await log.save();
    } catch (error) {
      console.error("Error in createLog:", error);
      throw error;
    }
  },

  get: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        actionType,
        startDate,
        endDate,
      } = req.query;

      const query = { schoolId: req.user.id };

      if (actionType) {
        query.actionType = actionType;
      }

      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const logs = await logsModel
        .find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const count = await logsModel.countDocuments(query);

      return res.status(200).json({
        logs,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalLogs: count,
      });
    } catch (error) {
      console.error("Error fetching logs:", error);
      return res.status(500).json({
        message: "Failed to fetch logs. Please try again later",
        error: error.message,
      });
    }
  },

  getByActionType: async (req, res) => {
    try {
      const { actionType } = req.params;
      const logs = await logsModel
        .find({
          schoolId: req.user.id,
          actionType,
        })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json({ logs });
    } catch (error) {
      console.error("Error fetching logs by action type:", error);
      return res.status(500).json({
        message: "Failed to fetch logs by action type",
        error: error.message,
      });
    }
  },
};
