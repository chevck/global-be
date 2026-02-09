const express = require("express");
const router = express.Router();
const emailController = require("../controllers/email.controller");

router.post(
  "/email/sendMemberInviteMail",
  emailController.sendFoundationMemberInviteMail
);

module.exports = router;
