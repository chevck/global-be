const express = require("express");
const mailController = require("../controllers/mails.controller");

const router = express.Router();
// for authentication/middleware of these endpoints,
// I'm considering checking some details on firebase
router.post("/welcome", mailController.sendFoundationWelcomeEmail);

module.exports = router;
