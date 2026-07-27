const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/reset-password", authController.requestPasswordReset);
router.get("/verify-reset-token", authController.verifyPasswordRequestToken);
router.post("/confirm-reset-password", authController.resetPassword);

module.exports = router;
