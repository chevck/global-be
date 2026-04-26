const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const foundationWelcomeEmailTemplate = fs.readFileSync(
  path.join(__dirname, "../email-templates/welcome-message.html"),
  "utf8",
);

const FOUNDATION_OS_SUPPORT_EMAIL = "thefoundationoscompany@gmail.com";

module.exports = {
  emailConfig: async (email, subject, html, user) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.FOUNDATION_GMAIL_MAIL_USER,
        pass: process.env.FOUNDATION_GMAIL_APP_PASSWORD,
      },
    });

    // Define mail options
    const mailOptions = {
      from: credentials.user,
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

    // const resend = new Resend(process.env.RESEND_API_KEY);
    // resend.emails.send({
    //   from: "onboarding@resend.dev",
    //   to: email,
    //   subject,
    //   html,
    // });
  },

  sendWelcomeEmail: async (body) => {
    console.log("sending welcome mail", body);
    try {
      const htmlWithData = foundationWelcomeEmailTemplate
        .replace("{{ foundation_name }}", body.ngoName)
        .replace("{{ first_name }}", body.firstName)
        .replace("{{ foundation_name }}", body.ngoName)
        .replace("{{ login_url }}", body.loginUrl)
        .replace("{{ login_url }}", body.loginUrl)
        .replace("{{ plan_name }}", body.planName)
        .replace("{{ plan_name }}", body.planName)
        .replace("{{ plan_price }}", body.planPrice)
        .replace(
          "{{ next_charge_date }}",
          new Date(body.nextChargeDate).toLocaleDateString(),
        )
        .replace("{{ support_email }}", FOUNDATION_OS_SUPPORT_EMAIL)
        .replace("{{ support_email }}", FOUNDATION_OS_SUPPORT_EMAIL)
        .replace("{{ login_url }}", body.loginUrl)
        .replace("{{ support_email }}", FOUNDATION_OS_SUPPORT_EMAIL)
        .replace("{{ foundation_name }}", body.ngoName);
      await module.exports.emailConfig(
        body.adminEmail,
        `${body.ngoName} - Welcome to The Foundation OS`,
        htmlWithData,
      );
      return { message: "Email sent" };
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
