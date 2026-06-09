const fs = require("fs");
const path = require("path");

const passwordResetTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/password-reset.html"),
  "utf8",
);

const SPEAKLY_SUPPORT_EMAIL =
  process.env.SPEAKLY_SUPPORT_EMAIL ?? "support@personadevelopments.com";

module.exports = {
  SPEAKLY_SUPPORT_EMAIL,

  sendPasswordResetMessage: (body) => {
    const appUrl = (body.appUrl ?? process.env.SPEAKLY_APP_URL ?? "").replace(
      /\/$/,
      "",
    );

    return passwordResetTemplate
      .replaceAll("{{first_name}}", body.firstName ?? "there")
      .replaceAll("{{email}}", body.email ?? "")
      .replaceAll("{{reset_url}}", body.resetUrl ?? "")
      .replaceAll("{{expiry_hours}}", body.expiryHours ?? "1")
      .replaceAll("{{app_url}}", appUrl)
      .replaceAll("{{speakly_url}}", `${appUrl}/speakly/welcome`)
      .replaceAll("{{support_email}}", SPEAKLY_SUPPORT_EMAIL);
  },
};
