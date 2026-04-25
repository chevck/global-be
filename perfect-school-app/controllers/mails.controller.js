const {} = require("../utils");
module.exports = {
  sendFoundationWelcomeEmail: async (req, res) => {
    try {
      console.log("req body", req.body);
    } catch (error) {
      console.log("error sending welcome email", error);
      res.status(500).json({
        message: "Unfortunately, there was an issue with sending welcome email",
      });
    }
  },
};
