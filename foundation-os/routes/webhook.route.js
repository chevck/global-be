const express = require("express");
const requireCronWebhookSecret = require("../middlewares/requireCronWebhookSecret");
const ngosRenewalWebhookController = require("../controllers/ngosRenewalWebhook.controller");

const router = express.Router();

/** POST secured — call from cron (e.g. daily 00:00) or scheduler */
router.post(
  "/cron/ngos/expired-paid-subscriptions",
  requireCronWebhookSecret,
  ngosRenewalWebhookController.processExpiredPaidNgosRenewal,
);

module.exports = router;
