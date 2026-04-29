const express = require("express");
const mailController = require("../controllers/mails.controller");

const router = express.Router();
// for authentication/middleware of these endpoints,
// I'm considering checking some details on firebase
router.post("/welcome", mailController.sendFoundationWelcomeEmail);
router.post(
  "/admin-waitlist-notification",
  mailController.notifyAdminForNewWaitlistUser,
);
router.post("/new-user-notification", mailController.notifyAdminForNewUsers);
router.post("/member-invite", mailController.inviteTeamMembersMail); // needs to be authenticated

module.exports = router;
