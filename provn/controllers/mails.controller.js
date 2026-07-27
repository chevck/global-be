const { Resend } = require("resend");
const { sendPasswordResetMessage } = require("../utils");

const resend = new Resend(process.env.RESEND_MAIL_API_KEY);

module.exports = {
  sendPasswordResetEmail: async ({
    email,
    firstName,
    resetUrl,
    expiryHours,
    appUrl,
  }) => {
    try {
      const { data, error } = await resend.emails.send({
        from: "PERSONA - Provn <noreply@usefoundationos.com>",
        to: [email],
        subject: "Forgot your password?",
        html: sendPasswordResetMessage({
          email,
          firstName,
          resetUrl,
          expiryHours,
          appUrl,
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
};
