const express = require("express");
const mailController = require("../controllers/mails.controller");
const checkAuthorization = require("../middlewares/checkAuthorization");

const router = express.Router();
router.post("/welcome", mailController.sendFoundationWelcomeEmail);
router.post(
  "/admin-waitlist-notification",
  mailController.notifyAdminForNewWaitlistUser,
);
router.post("/new-user-notification", mailController.notifyAdminForNewUsers);
router.post(
  "/member-invite",
  checkAuthorization,
  mailController.inviteTeamMembersMail,
);
router.post(
  "/assign-task",
  checkAuthorization,
  mailController.sendTaskNotification,
);

module.exports = router;
