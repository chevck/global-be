const { randomBytes } = require("crypto");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { sendPasswordResetEmail } = require("./mails.controller.js");
const { db } = require("../../foundation-os/utils/firebase");

module.exports = {
  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).send("You need to send email");
      const db = getFirestore();
      const auth = getAuth();
      const user = await auth.getUserByEmail(email.toLowerCase());
      if (!user)
        return res.status(404).send({
          message: "This user is invalid. Please try a different email",
        });
      // Generate a secure random token (64 hex chars)
      const token = randomBytes(32).toString("hex");
      // Store in Firestore with 1-hour expiry
      await db
        .collection("passwordResets")
        .doc(token)
        .set({
          uid: user.uid,
          email: user.email,
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 60 * 60 * 1000)),
          used: false,
        });
      const resetLink = `${req.headers.origin}/provn/reset-password?token=${token}`;
      const firstName =
        user.displayName?.trim().split(/\s+/)[0] ||
        user.email?.split("@")[0] ||
        "there";
      await sendPasswordResetEmail({
        email: user.email,
        firstName,
        resetUrl: resetLink,
        expiryHours: "1",
        appUrl: req.headers.origin,
      });
      res.status(200).json({
        message: "A reset link has been sent to the email sent.",
      });
    } catch (error) {
      console.log({ error }, "requesting password reset");
      res.status(400).json({
        message: "There was an error sending email to the email",
      });
    }
  },

  verifyPasswordRequestToken: async (req, res) => {
    try {
      const passwordResetDoc = await db
        .collection("passwordResets")
        .doc(req.query.token)
        .get();
      if (!passwordResetDoc)
        return res.status(404).send({
          message: "This is an invalid token, please contact support email",
        });
      const doc = passwordResetDoc.data();
      if (doc.expiresAt.toMillis() <= Date.now())
        return res.status(400).send({
          message: "This is an expired token. Request another rest email",
        });
      return res.status(200).send({ json: doc });
    } catch (error) {
      console.log("error verifying password request token", error);
      res.status(500).send({ json: "Error verifying request token" });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const ref = db.collection("passwordResets").doc(req.body.token);
      const doc = await ref.get();
      if (!doc.exists) {
        return res.status(400).json({ error: "Invalid or expired token." });
      }
      const data = doc.data();
      if (data.used) {
        return res
          .status(400)
          .json({ error: "This reset link has already been used." });
      }
      if (data.expiresAt.toDate() < new Date()) {
        return res.status(400).json({ error: "This reset link has expired." });
      }
      const auth = getAuth();
      await auth.updateUser(data.uid, { password: req.body.newPassword });
      await ref.update({ used: true, usedAt: Timestamp.now() });
      res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
      console.log("error resetting password", error);
      res.status(400).json({
        message:
          "There was an error resetting your password. Please try again later",
      });
    }
  },
};
