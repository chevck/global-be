const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emails.controller");

router.post("/successful-purchase", emailController.successfulPurchaseMail);

module.exports = router;
