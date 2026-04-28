const express = require("express");
const paymentController = require("../controllers/payment.controller");
const router = express.Router();

router.post("/verify", paymentController.verifyPaymentTransaction);

module.exports = router;
