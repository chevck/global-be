const fs = require("fs");
const path = require("path");

const passwordResetTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/password-reset.html"),
  "utf8",
);

const PROVN_SUPPORT_EMAIL =
  process.env.PROVN_SUPPORT_EMAIL ?? "support@personadevelopments.com";

module.exports = {
  PROVN_SUPPORT_EMAIL,

  sendPasswordResetMessage: (body) => {
    const appUrl = (body.appUrl ?? process.env.PROVN_APP_URL ?? "").replace(
      /\/$/,
      "",
    );

    return passwordResetTemplate
      .replaceAll("{{first_name}}", body.firstName ?? "there")
      .replaceAll("{{email}}", body.email ?? "")
      .replaceAll("{{reset_url}}", body.resetUrl ?? "")
      .replaceAll("{{expiry_hours}}", body.expiryHours ?? "1")
      .replaceAll("{{app_url}}", appUrl)
      .replaceAll("{{provn_url}}", `${appUrl}/provn/welcome`)
      .replaceAll("{{support_email}}", PROVN_SUPPORT_EMAIL);
  },
};
