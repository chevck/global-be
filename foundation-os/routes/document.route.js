const express = require("express");
const documentController = require("../controllers/document.controller");
const checkAuthorization = require("../middlewares/checkAuthorization");

const router = express.Router();

router.post(
  "/impact-report",
  checkAuthorization,
  documentController.handleGenerateImpactReport,
);

module.exports = router;
