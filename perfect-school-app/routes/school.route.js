const express = require("express");
const schoolController = require("../controllers/school.controller");
const { checkAuthorization } = require("../middlewares/checkAuthorization");
const router = express.Router();

router.post("/register", schoolController.register);
router.post("/login", schoolController.login);
router.post("/verify-email-otp", schoolController.verifyEmailOTP);
router.get("/dashboard", checkAuthorization, schoolController.dashboard);

module.exports = router;
