const express = require("express");
const paymentController = require("../controllers/payment.controller");
const checkAuthorization = require("../middlewares/checkAuthorization");
const router = express.Router();

router.post("/verify", paymentController.verifyPaymentTransaction);
router.post("/create-account", paymentController.createVirtualAccount);
router.get("/banks", checkAuthorization, paymentController.getAllBanks);

module.exports = router;
