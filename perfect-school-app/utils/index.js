const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");
const registrationTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/registration.html"),
  "utf8"
);
const otpTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/otp-email.html"),
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
        .replace("{{ schoolName }}", body.schoolName)
        .replace("{{ date }}", new Date().toLocaleDateString())
        .replace("{{ plan }}", "Starter Plan")
        .replace("{{ registrationId }}", body.registrationId)
        .replace(
          "{{ loginUrl }}",
          process.env.FRONTEND_APP_BASE_URL + "/sign-in"
        );
      await module.exports.sendEmail(
        body.adminEmail,
        "Welcome to Perfect School App",
        htmlWithData
      );
      return { message: "Email sent" };
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  sendOTPEmail: async (body) => {
    try {
      const htmlWithData = otpTemplate
        .replace("{{ otp }}", body.otp)
        .replace("{{ date }}", new Date().toLocaleDateString());
      await module.exports.sendEmail(
        body.email,
        "OTP for Perfect School App",
        htmlWithData
      );
      return { message: "Email sent" };
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  generateNumericCode: (length = 6) => {
    let code = "";
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10); // digits 0–9
    }
    return code;
  },
};
