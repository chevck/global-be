const { Resend } = require("resend");
// const registrationTemplate = require("../email-templates/registration.html");
const fs = require("fs");
const path = require("path");
const registrationTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/registration.html"),
  "utf8"
);

module.exports = {
  sendEmail: async (email, subject, html) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject,
      html,
    });
  },

  sendRegisterEmail: async (body) => {
    try {
      const htmlWithData = registrationTemplate
        // .replace("{{name}}", "Excellence")
        .replace("{{ date }}", new Date().toLocaleDateString())
        .replace("{{ plan }}", "Learner Plan");
      // console.log("htmlWithData", htmlWithData);
      await module.exports.sendEmail(
        body.email,
        "Welcome to Perfect School App",
        htmlWithData
      );
      return { message: "Email sent" };
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },
};
