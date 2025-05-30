const { Resend } = require("resend");

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
      await this.sendEmail(
        body.email,
        "Welcome to Perfect School App",
        "<p>Welcome to Perfect School App</p>"
      );
      return { message: "Email sent" };
    } catch (error) {
      return { message: "Failed to send email" };
    }
  },
};
