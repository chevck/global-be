const { sendEmail } = require("../utils");

module.exports = {
  sendEmail: async (req, res) => {
    try {
      console.log("ss", req.body);
      // req.body should contain emailTemplateTitle
    } catch (error) {}
  },
};
