const {
  sendWelcomeEmail,
  sendWaitlistSignupMessage,
  sendTeamInviteEmail,
  sendNewUserMessage,
} = require("../utils");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_MAIL_API_KEY);

module.exports = {
  sendFoundationWelcomeEmail: async (req, res) => {
    try {
      const { data, error } = await resend.emails.send({
        from: "Foundation OS <noreply@usefoundationos.com>",
        to: [req.body.email],
        subject: `${req.body.ngoName ?? "Welcome"} - Welcome to Foundation OS`,
        html: sendWelcomeEmail(req.body),
      });
      if (error) throw error;
      return res
        .status(200)
        .json({ message: "Welcome email sent", id: data?.id });
    } catch (error) {
      console.log("error sending welcome email", error);
      res.status(500).json({
        message: "Unfortunately, there was an issue with sending welcome email",
      });
    }
  },

  notifyAdminForNewWaitlistUser: async (req, res) => {
    try {
      const { data, error } = await resend.emails.send({
        from: "Foundation OS <noreply@usefoundationos.com>",
        to: ["excellence@usefoundationos.com"],
        subject: "New Foundation Signup 🥳",
        html: sendWaitlistSignupMessage(req.body),
      });
      if (error) throw error;
      return res.status(200).json({
        message: "Admin Waitlist Notification email sent",
        id: data?.id,
      });
    } catch (error) {
      console.log("error sending email to notify admin", error);
      res.status(400).send({
        message: "There was an error sending waitlist admin notification",
      });
    }
  },

  notifyAdminForNewUsers: async (req, res) => {
    try {
      const { data, error } = await resend.emails.send({
        from: `Foundation OS <noreply@usefoundationos.com>`,
        to: ["hello@usefoundationos.com", "oyeniranexcellenced@gmail.com"],
        subject: `${req.body.ngoName} just signed up 🎉`,
        html: sendNewUserMessage(req.body),
      });
      if (error) throw error;
      return res.status(200).json({
        message: "Team invite email sent",
        id: data?.id,
      });
    } catch (error) {
      console.log("error sending email to invite team member", error);
      res.status(400).send({
        message: "There was an error sending invite to team member",
      });
    }
  },

  inviteTeamMembersMail: async (req, res) => {
    try {
      const { data, error } = await resend.emails.send({
        from: `${req.body.ngoName} - Foundation OS <noreply@usefoundationos.com>`,
        to: [req.body.email],
        subject: `${req.body.ngoName} is inviting you into the team`,
        html: sendTeamInviteEmail(req.body),
      });
      if (error) throw error;
      return res.status(200).json({
        message: "Team invite email sent",
        id: data?.id,
      });
    } catch (error) {
      console.log("error sending email to invite team member", error);
      res.status(400).send({
        message: "There was an error sending invite to team member",
      });
    }
  },
};
