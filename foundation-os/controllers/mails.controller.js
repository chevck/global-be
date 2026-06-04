const {
  sendWelcomeEmail,
  sendWaitlistSignupMessage,
  sendTeamInviteEmail,
  sendNewUserMessage,
  sendTaskAssignmentNotificationMessage,
  sendMilestoneStepAssignmentNotificationMessage,
  sendSubscriptionUpgradeMessage,
  sendVolunteerInviteMessage,
  sendPasswordResetMessage,
  sendConfirmPasswordReset,
  sendDemoSignupMessage,
} = require("../utils");
const { Resend } = require("resend");
const { db } = require("../utils/firebase");
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
        to: ["oyeniranexcellenced@gmail.com", "excellence@usefoundationos.com"],
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

  notifyAdminForDemoUsers: async (req, res) => {
    try {
      const { data, error } = await resend.emails.send({
        from: "Foundation OS <noreply@usefoundationos.com>",
        to: ["oyeniranexcellenced@gmail.com", "excellence@usefoundationos.com"],
        subject: "New Foundation Wants Demo 🥳",
        html: sendDemoSignupMessage(req.body),
      });
      if (error) throw error;
      return res.status(200).json({
        message: "Admin Demo Signup Notification email sent",
        id: data?.id,
      });
    } catch (error) {
      console.log("error sending email to notify admin for demo signup", error);
      res.status(400).send({
        message: "There was an error sending demo signup admin notification",
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

  sendTaskNotification: async (req, res) => {
    try {
      const dataIds = [];
      for (const assignee of req.body.assignees) {
        const { data, error } = await resend.emails.send({
          from: `${req.body.ngoName} - Foundation OS <noreply@usefoundationos.com>`,
          to: [assignee.email],
          subject: `${req.body.assignerName} assigned a new task to you`,
          html: sendTaskAssignmentNotificationMessage({
            ...req.body,
            assignee,
          }),
        });
        if (error) throw error;
        dataIds.push(data.id);
      }
      return res.status(200).json({
        message: "Task assignment email sent successfully!",
        ids: dataIds,
      });
    } catch (error) {
      console.log("error sending task assignment email", error);
      res.status(400).send({
        message: "There was an error sending task assignment email",
      });
    }
  },

  sendSubscriptionUpgradeNotification: async (req, res) => {
    try {
      const { data, error } = await resend.emails.send({
        from: `Foundation OS <noreply@usefoundationos.com>`,
        to: [req.body.ngoEmail],
        subject: `You have upgraded to ${req.body.newPlan} Plan`,
        html: sendSubscriptionUpgradeMessage(req.body),
      });
      if (error) throw error;
      return res.status(200).json({
        message: "Subscription upgrade email sent",
        id: data?.id,
      });
    } catch (error) {
      console.log("error sending subscription upgrade email", error);
      res.status(400).send({
        message: "There was an error sending subscription upgrade email",
      });
    }
  },

  sendVolunteerInviteNotification: async (req, res) => {
    try {
      const { data, error } = await resend.emails.send({
        from: `${req.body.ngoName} - Foundation OS <noreply@usefoundationos.com>`,
        to: [req.body.email],
        subject: `You have invited to join ${req.body.ngoName} on ${req.body.projectTitle} project`,
        html: sendVolunteerInviteMessage(req.body),
      });
      if (error) throw error;
      return res.status(200).json({
        message: "Volunteer Invite email sent",
        id: data?.id,
      });
    } catch (error) {
      console.log("error sending volunteer invite email", error);
      res.status(400).send({
        message:
          "There was an error sending volunteer invitemm mm knfe kfkfr email",
      });
    }
  },

  sendPasswordResetEmail: async (email, resetLink) => {
    try {
      const ngoSnapshot = await db
        .collection("ngos")
        .where("email", "==", email)
        .limit(1)
        .get();
      if (ngoSnapshot.empty) {
        return {
          message: "No account found for this email address",
        };
      }
      const ngoDoc = ngoSnapshot.docs[0];
      const ngo = { id: ngoDoc.id, ...ngoDoc.data() };
      const { data, error } = await resend.emails.send({
        from: `Foundation OS <noreply@usefoundationos.com>`,
        to: [email],
        cc: [ngo.ngoEmail],
        subject: `You have requested to reset your password`,
        html: sendPasswordResetMessage({
          firstName: ngo.firstName,
          resetUrl: resetLink,
          expiry_hours: "1 hour",
        }),
      });
      if (error) throw error;
      return {
        message: "Password reset email sent",
        id: data?.id,
      };
    } catch (error) {
      console.log("error sending password reset email", error);
      return {
        message: "There was an error sending password reset email",
      };
    }
  },

  sendConfirmPasswordResetMail: async (email) => {
    try {
      const ngoSnapshot = await db
        .collection("ngos")
        .where("email", "==", email)
        .limit(1)
        .get();
      if (ngoSnapshot.empty) {
        return {
          message: "No account found for this email address",
        };
      }
      const ngoDoc = ngoSnapshot.docs[0];
      const ngo = { id: ngoDoc.id, ...ngoDoc.data() };
      const { data, error } = await resend.emails.send({
        from: `Foundation OS <noreply@usefoundationos.com>`,
        to: [email],
        cc: [ngo.ngoEmail],
        subject: `You password has been reset`,
        html: sendConfirmPasswordReset({
          firstName: ngo.firstName,
        }),
      });
      if (error) throw error;
      return {
        message: "Password confirm reset email sent",
        id: data?.id,
      };
    } catch (error) {
      console.log("error sending password confirm reset email", error);
      return {
        message: "There was an error sending password reset email",
      };
    }
  },

  sendMileStoneAssignmentNotification: async (req, res) => {
    try {
      if (!req.body.projectId)
        return res.status(400).send({
          json: "ProjectId is not found. Please send ProjectId to try again",
        });
      const project = await db
        .collection("projects")
        .doc(req.body.projectId)
        .get();
      if (!project)
        return res.status(400).send({
          json: "Invalid Project. Use a valid projectId and try again",
        });
      const projectData = project.data();
      const ngoSnapshot = await db
        .collection("ngos")
        .where("userId", "==", projectData.userId)
        .limit(1)
        .get();
      if (ngoSnapshot.empty) {
        return {
          message: "No account found for this email address",
        };
      }
      const ngoDoc = ngoSnapshot.docs[0];
      const ngo = { id: ngoDoc.id, ...ngoDoc.data() };
      const dataIds = [];
      for (const assignee of req.body.assignees) {
        let assigneeData;
        if (assignee.type === "member") {
          const assigneeeSnapshot = await db
            .collection("foundationMembers")
            .where("userId", "==", assignee.id)
            .limit(1)
            .get();
          assigneeData = assigneeeSnapshot.docs[0].data();
        }
        if (assignee.type === "volunteer") {
          const volunteerSnapshot = await db
            .collection("volunteers")
            .doc(assignee.id)
            .get();
          assigneeData = volunteerSnapshot.data();
        }
        const { data, error } = await resend.emails.send({
          from: `${ngo.ngoName} - Foundation OS <noreply@usefoundationos.com>`,
          to: [assigneeData.email],
          subject: `${req.body.assigner} assigned you a milestone step on ${req.body.milestoneTitle}`,
          html: sendMilestoneStepAssignmentNotificationMessage({
            ngoName: ngo.ngoName,
            projectTitle: projectData.title,
            stepUrl: `${req.headers.origin}/projects/${project.id}?tab=steps&step=${req.body.mileStoneId}`,
            assigneeName: assigneeData.name ?? assigneeData?.displayName ?? "",
            ...req.body,
          }),
        });
        if (error) throw error;
        dataIds.push(data.id);
      }
      return res.status(200).json({
        message: "Milestone step assignment email sent successfully!",
        ids: dataIds,
      });
    } catch (error) {
      console.log("error sending milestone assignment notification", error);
      res.status(400).send({
        message: "There was an error sending milestone step assignment email",
      });
    }
  },
};
