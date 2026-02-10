const { sendEmail } = require("../utils");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const memberInviteMailTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/foundation-os/team-invite.html"),
  "utf8"
);
const taskNotificatitonTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/foundation-os/task-assigned.html"),
  "utf8"
);
const taskDueReminderTemplate = fs.readFileSync(
  path.join(
    __dirname,
    "../email-templates/foundation-os/task-due-reminder.html"
  ),
  "utf8"
);
const foundationWelcomeTemplate = fs.readFileSync(
  path.join(
    __dirname,
    "../email-templates/foundation-os/foundation-welcome.html"
  ),
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
  sendTaskNotificationMail: async (req, res) => {
    console.log("body", req.body);
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
  sendTaskDueReminderMail: async (req, res) => {
    try {
      const {
        email,
        assigneeName,
        foundationName,
        reminderHeading,
        reminderIntro,
        taskTitle,
        projectName,
        taskDueDate,
        taskUrl,
        urgencyText,
        taskStatus,
        taskDescription,
      } = req.body;

      let htmlWithData = taskDueReminderTemplate
        .replace(/\{\{\s*assignee_name\s\}\}/g, assigneeName ?? "")
        .replace(/\{\{\s*foundation_name\s\}\}/g, foundationName ?? "")
        .replace(
          /\{\{\s*reminder_heading\s\}\}/g,
          reminderHeading ?? "Task due reminder"
        )
        .replace(
          /\{\{\s*reminder_intro\s\}\}/g,
          reminderIntro ?? "You have a task that needs your attention."
        )
        .replace(/\{\{\s*task_title\s\}\}/g, taskTitle ?? "")
        .replace(/\{\{\s*project_name\s\}\}/g, projectName ?? "")
        .replace(/\{\{\s*task_due_date\s\}\}/g, taskDueDate ?? "")
        .replace(/\{\{\s*task_url\s\}\}/g, taskUrl ?? "");

      // Optional: urgency_text block
      htmlWithData = htmlWithData.replace(
        /\{\{#if urgency_text\}\}([\s\S]*?)\{\{\/if\}\}/,
        (_, block) =>
          urgencyText != null && urgencyText !== ""
            ? block.replace(/\{\{\s*urgency_text\s\}\}/g, urgencyText)
            : ""
      );

      // Optional: task_status block
      htmlWithData = htmlWithData.replace(
        /\{\{#if task_status\}\}([\s\S]*?)\{\{\/if\}\}/,
        (_, block) =>
          taskStatus != null && taskStatus !== ""
            ? block.replace(/\{\{\s*task_status\s\}\}/g, taskStatus)
            : ""
      );

      // Optional: task_description block
      htmlWithData = htmlWithData.replace(
        /\{\{#if task_description\}\}([\s\S]*?)\{\{\/if\}\}/,
        (_, block) =>
          taskDescription != null && taskDescription !== ""
            ? block.replace(/\{\{\s*task_description\s\}\}/g, taskDescription)
            : ""
      );

      await sendEmail(
        email,
        reminderHeading ?? "Task due reminder",
        htmlWithData,
        "foundation"
      );
      return res.status(200).send("Email sent successfully");
    } catch (error) {
      console.log({ error });
      return res
        .status(500)
        .json({ message: "error sending task due reminder email" });
    }
  },
  sendFoundationWelcomeMail: async (req, res) => {
    try {
      const { email, ownerName, foundationName, loginUrl } = req.body;
      const url =
        loginUrl || process.env.FOUNDATION_OS_FRONTEND_BASE_URL || "#";
      const htmlWithData = foundationWelcomeTemplate
        .replace(/\{\{\s*owner_name\s\}\}/g, ownerName ?? "")
        .replace(/\{\{\s*foundation_name\s\}\}/g, foundationName ?? "")
        .replace(/\{\{\s*login_url\s\}\}/g, url);
      await sendEmail(
        email,
        `Welcome to Foundation OS – ${foundationName} is ready`,
        htmlWithData,
        "foundation"
      );
      return res.status(200).send("Email sent successfully");
    } catch (error) {
      console.log({ error });
      return res
        .status(500)
        .json({ message: "error sending foundation welcome email" });
    }
  },
};
