const express = require("express");
const mailController = require("../controllers/mails.controller");
const checkAuthorization = require("../middlewares/checkAuthorization");

const router = express.Router();
router.post("/welcome", mailController.sendFoundationWelcomeEmail);
router.post(
  "/admin-waitlist-notification",
  mailController.notifyAdminForNewWaitlistUser,
);
router.post("/admin-demo-request", mailController.notifyAdminForDemoUsers);
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
router.post(
  "/assign-milestone-step",
  checkAuthorization,
  mailController.sendMileStoneAssignmentNotification,
);
router.post(
  "/subscription-upgrade",
  checkAuthorization,
  mailController.sendSubscriptionUpgradeNotification,
);
router.post(
  "/volunteer-invite",
  checkAuthorization,
  mailController.sendVolunteerInviteNotification,
);

module.exports = router;
