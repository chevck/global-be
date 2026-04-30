const express = require("express");
const paymentController = require("../controllers/payment.controller");
const checkAuthorization = require("../middlewares/checkAuthorization");
const router = express.Router();

router.post("/verify", paymentController.verifyPaymentTransaction);
router.get("/banks", checkAuthorization, paymentController.getAllBanks); // needs to be authenticated

module.exports = router;
