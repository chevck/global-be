const express = require("express");
const schoolController = require("../controllers/school.controller");
const router = express.Router();

router.post("/register", schoolController.register);
router.post("/login", schoolController.login);
router.post("/verify-email-otp", schoolController.verifyEmailOTP);

module.exports = router;
