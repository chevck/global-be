const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const foundationWelcomeEmailTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/welcome-message.html"),
  "utf8",
);
const newWaitlistUserSignupEmailTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/waitlist-signup.html"),
  "utf8",
);
const newDemoUserSignupEmailTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/demo-signup.html"),
  "utf8",
);
const newTeamMemberInviteMessage = fs.readFileSync(
  path.join(__dirname, "../email-templates/team-invite.html"),
  "utf8",
);
const newUserNotificationMessage = fs.readFileSync(
  path.join(__dirname, "../email-templates/new-user-signup.html"),
  "utf8",
);
const taskAssignmentNotification = fs.readFileSync(
  path.join(__dirname, "../email-templates/task-assigned.html"),
  "utf8",
);
const milestoneStepAssignmentNotification = fs.readFileSync(
  path.join(__dirname, "../email-templates/milestone-step.html"),
  "utf8",
);
const subscriptionUpgradeMessage = fs.readFileSync(
  path.join(__dirname, "../email-templates/subscription-upgrade.html"),
  "utf8",
);
const volunteerInviteMessage = fs.readFileSync(
  path.join(__dirname, "../email-templates/volunteer-invite.html"),
  "utf8",
);
const passwordResetMessage = fs.readFileSync(
  path.join(__dirname, "../email-templates/password-reset.html"),
  "utf8",
);

const FOUNDATION_OS_SUPPORT_EMAIL = "thefoundationoscompany@gmail.com";

module.exports = {
  emailConfig: async (email, subject, html, user) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // or 465 for SSL
      secure: false,
      auth: {
        user: process.env.FOUNDATION_OS_SUPPORT_EMAIL,
        pass: process.env.FOUNDATION_GMAIL_MAIL_PASSWORD,
      },
    });

    // Define mail options
    const mailOptions = {
      from: process.env.FOUNDATION_OS_SUPPORT_EMAIL,
      to: email,
      subject,
      html,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("Error:", error);
      }
      console.log("Email sent:", info.response);
    });
  },

  sendWelcomeEmail: (body) => {
    try {
      return foundationWelcomeEmailTemplate
        .replaceAll("{{foundation_name}}", body.ngoName)
        .replaceAll("{{first_name}}", body.firstName)
        .replaceAll("{{login_url}}", body.loginUrl)
        .replaceAll("{{plan_name}}", body.planName)
        .replaceAll("{{plan_price}}", body.planPrice)
        .replaceAll(
          "{{next_charge_date}}",
          new Date(body.nextChargeDate).toLocaleDateString(),
        )
        .replaceAll("{{support_email}}", FOUNDATION_OS_SUPPORT_EMAIL);
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  sendDemoSignupMessage: (body) => {
    try {
      return newDemoUserSignupEmailTemplate
        .replaceAll("{{foundation_name}}", body.organization)
        .replaceAll("{{contact_person}}", body.name)
        .replaceAll("{{email}}", body.email)
        .replaceAll("{{team_size}}", body.teamSize)
        .replaceAll("{{message}}", body.message)
        .replaceAll(
          "{{admin_url}}",
          "https://foundation-os-admin.netlify.app/",
        );
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  sendWaitlistSignupMessage: (body) => {
    try {
      return newWaitlistUserSignupEmailTemplate
        .replaceAll("{{foundation_name}}", body.ngoName)
        .replaceAll("{{contact_person}}", body.contactPerson)
        .replaceAll("{{email}}", body.email)
        .replaceAll("{{country}}", body.country)
        .replaceAll("{{message}}", body.message)
        .replaceAll("{{admin_url}}", body.adminUrl);
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  sendTeamInviteEmail: (body) => {
    try {
      return newTeamMemberInviteMessage
        .replaceAll("{{foundation_name}}", body.ngoName)
        .replaceAll("{{inviter_name}}", body.invitedBy ?? "Admin")
        .replaceAll("{{first_name}}", body.firstName)
        .replaceAll("{{role}}", body.role)
        .replaceAll("{{role_description}}", body.roleDescription ?? "-")
        .replaceAll("{{invite_url}}", body.inviteUrl);
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  sendNewUserMessage: (body) => {
    try {
      return newUserNotificationMessage
        .replaceAll("{{foundation_name}}", body.ngoName)
        .replaceAll("{{first_name}}", body.firstName);
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  sendTaskAssignmentNotificationMessage: (body) => {
    try {
      return taskAssignmentNotification
        .replaceAll("{{foundation_name}}", body.ngoName)
        .replaceAll("{{assignee_name}}", body.assignee.label)
        .replaceAll("{{assigner_name}}", body.assignerName ?? "Admin")
        .replaceAll("{{task_title}}", body.title)
        .replaceAll("{{project_name}}", body.projectTitle)
        .replaceAll("{{task_due_date}}", body.endDate)
        .replaceAll("{{task_status}}", body.status)
        .replaceAll("{{task_url}}", body.taskUrl)
        .replaceAll("{{task_description}}", body.description);
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  sendMilestoneStepAssignmentNotificationMessage: (body) => {
    try {
      return milestoneStepAssignmentNotification
        .replaceAll("{{foundation_name}}", body.ngoName)
        .replaceAll("{{assignee_name}}", body.assigneeName)
        .replaceAll("{{assigner_name}}", body.assigner ?? "Admin")
        .replaceAll("{{step_title}}", body.mileStoneTitle)
        .replaceAll("{{milestone_name}}", body.mileStoneTitle)
        .replaceAll("{{project_name}}", body.projectTitle)
        .replaceAll("{{step_due_date}}", body.dueDate)
        .replaceAll("{{step_status}}", body.status)
        .replaceAll("{{step_url}}", body.stepUrl)
        .replaceAll("{{step_description}}", body.mileStoneDescription ?? "");
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  sendSubscriptionUpgradeMessage: (body) => {
    try {
      return subscriptionUpgradeMessage
        .replaceAll("{{foundation_name}}", body.ngoName)
        .replaceAll("{{new_plan_display}}", body.newPlan)
        .replaceAll("{{subscriber_name}}", body.userName)
        .replaceAll("{{previous_plan_display}}", body.previousPlan)
        .replaceAll("{{price_summary}}", body.price)
        .replaceAll("{{charged_today_summary}}", body.chargedAt)
        .replaceAll("{{next_billing_date}}", body.nextChargeAt)
        .replaceAll("{{support_email}}", FOUNDATION_OS_SUPPORT_EMAIL)
        .replaceAll("{{manage_subscription_url}}", body.manageSubscriptionUrl);
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  sendVolunteerInviteMessage: (body) => {
    try {
      return volunteerInviteMessage
        .replaceAll("{{project_name}}", body.projectTitle)
        .replaceAll("{{first_name}}", body.firstName)
        .replaceAll("{{inviter_name}}", body.invitedBy)
        .replaceAll("{{foundation_name}}", body.ngoName)
        .replaceAll("{{role}}", body.roleLabel)
        .replaceAll("{{role_description}}", "")
        .replaceAll("{{invite_url}}", body.inviteUrl);
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  sendPasswordResetMessage: (body) => {
    try {
      return passwordResetMessage
        .replaceAll("{{first_name}}", body.firstName)
        .replaceAll("{{expiry_hours}}", body.expiryHours ?? "1")
        .replaceAll("{{reset_url}}", body.resetUrl)
        .replaceAll("{{support_email}}", FOUNDATION_OS_SUPPORT_EMAIL);
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  sendConfirmPasswordReset: (body) => {
    try {
      return passwordResetMessage
        .replaceAll("{{first_name}}", body.firstName)
        .replaceAll("{{account_email}}", body.firstName)
        .replaceAll("{{support_email}}", FOUNDATION_OS_SUPPORT_EMAIL);
    } catch (error) {
      console.log("error", error);
      return { message: "Failed to send email" };
    }
  },

  // sendOTPEmail: async (body) => {
  //   try {
  //     const htmlWithData = otpTemplate
  //       .replace("{{ otp }}", body.otp)
  //       .replace("{{ date }}", new Date().toLocaleDateString());
  //     await module.exports.sendEmail(
  //       body.email,
  //       "OTP for Perfect School App",
  //       htmlWithData,
  //     );
  //     return { message: "Email sent" };
  //   } catch (error) {
  //     console.log("error", error);
  //     return { message: "Failed to send email" };
  //   }
  // },

  // sendTeacherInviteEmail: async (body) => {
  //   try {
  //     const htmlWithData = teacherInviteTemplate
  //       .replace("{{ schoolName }}", body.schoolName)
  //       .replace("{{ teacherCode }}", body.teacherCode)
  //       .replace("{{ date }}", new Date().toLocaleDateString())
  //       .replace("{{ invitationExpiresAt }}", body.invitationExpiresAt)
  //       .replace("{{ registrationUrl }}", body.registrationUrl);
  //     await module.exports.sendEmail(
  //       body.teacherEmail,
  //       "Invitation to join " + body.schoolName + " via the Perfect School App",
  //       htmlWithData,
  //     );
  //     return { message: "Email sent" };
  //   } catch (error) {
  //     console.log("error", error);
  //     return { message: "Failed to send email" };
  //   }
  // },

  // generateNumericCode: (length = 6) => {
  //   let code = "";
  //   for (let i = 0; i < length; i++) {
  //     code += Math.floor(Math.random() * 10); // digits 0–9
  //   }
  //   return code;
  // },

  // formatDate: (date) => {
  //   const day = date.getDate();
  //   const month = date.toLocaleString("default", { month: "long" });
  //   const year = date.getFullYear();

  //   // Add ordinal suffix
  //   const ordinal = (n) => {
  //     const s = ["th", "st", "nd", "rd"],
  //       v = n % 100;
  //     return s[(v - 20) % 10] || s[v] || s[0];
  //   };

  //   return `${month} ${day}${ordinal(day)}, ${year}`;
  // },

  // formatNumberToThreeDigits: (num) => {
  //   return num.toString().padStart(3, "0");
  // },

  // nonAuthActionReasons: {
  //   STUDENT_EXAM_LOGIN: "student-exam-login",
  // },
};
