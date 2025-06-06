const express = require("express");
const logsController = require("../controllers/logs.controller");
const { checkAuthorization } = require("../middlewares/checkAuthorization");
const router = express.Router();

router.get("/logs", checkAuthorization, logsController.get);

module.exports = router;
