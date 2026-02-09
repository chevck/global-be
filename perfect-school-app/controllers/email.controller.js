const { sendEmail } = require("../utils");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const memberInviteMailTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/foundation-os/team-invite.html"),
  "utf8"
);

module.exports = {
  sendFoundationMemberInviteMail: async (req, res) => {
    try {
      const { foundationName, firstName, role, inviteToken, email } = req.body;
      // req.body should contain emailTemplateTitle
      const htmlWithData = memberInviteMailTemplate
        .replace("{{ first_name }}", firstName)
        .replace("{{ foundation_name }}", foundationName)
        .replace("{{ foundation_name }}", foundationName)
        .replace("{{ foundation_name }}", foundationName)
        .replace(
          "{{ invite_url }}",
          `${process.env.FOUNDATION_OS_FRONTEND_BASE_URL}/invite/${inviteToken}`
        )
        .replace(
          "{{ invite_url_link }}",
          `${process.env.FOUNDATION_OS_FRONTEND_BASE_URL}/invite/${inviteToken}`
        )
        .replace("{{ role }}", role);
      await sendEmail(
        email,
        `You have been invited to join ${foundationName}`,
        htmlWithData,
        "foundation"
      );
      return res.status(200).send("Email sent successfully");
    } catch (error) {
      console.log({ error });
      return res.status(500).json({ message: "error sending invite email" });
    }
  },
  sendRoleAssignmentMail: async (req, res) => {
    try {
      const { foundationName, firstName, role, inviteToken, email } = req.body;
      // req.body should contain emailTemplateTitle
      const htmlWithData = memberInviteMailTemplate
        .replace("{{ first_name }}", firstName)
        .replace("{{ foundation_name }}", foundationName)
        .replace("{{ foundation_name }}", foundationName)
        .replace("{{ foundation_name }}", foundationName)
        .replace(
          "{{ invite_url }}",
          `${process.env.FOUNDATION_OS_FRONTEND_BASE_URL}/invite/${inviteToken}`
        )
        .replace(
          "{{ invite_url_link }}",
          `${process.env.FOUNDATION_OS_FRONTEND_BASE_URL}/invite/${inviteToken}`
        )
        .replace("{{ role }}", role);
      await sendEmail(
        email,
        `You have been invited to join ${foundationName}`,
        htmlWithData,
        "foundation"
      );
      return res.status(200).send("Email sent successfully");
    } catch (error) {
      console.log({ error });
      return res.status(500).json({ message: "error sending invite email" });
    }
  },
};
