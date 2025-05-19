const rolesModel = require("../models/roles.model");

module.exports = {
  create: async (req, res) => {
    try {
      let role = new rolesModel(req.body);
      role = await role.save();
      return res.status(201).json({ ...role._doc });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to create this role right now. Please try again later",
        error,
      });
    }
  },
};
