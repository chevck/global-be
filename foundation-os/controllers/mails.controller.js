const { sendWelcomeEmail } = require("../utils");
module.exports = {
  sendFoundationWelcomeEmail: async (req, res) => {
    try {
      console.log("req body", req.body);
      await sendWelcomeEmail(req.body);
      return res.status(200).send("Welcome email sent successfully");
    } catch (error) {
      console.log("error sending welcome email", error);
      res.status(500).json({
        message: "Unfortunately, there was an issue with sending welcome email",
      });
    }
  },
};
