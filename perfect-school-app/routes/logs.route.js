const express = require("express");
const logsController = require("../controllers/logs.controller");
const { checkAuthorization } = require("../middlewares/checkAuthorization");
const router = express.Router();

// Get all logs with pagination and filtering
router.get("/logs", checkAuthorization, logsController.get);

// Get logs by action type
// router.get(
//   "/logs/:actionType",
//   checkAuthorization,
//   logsController.getByActionType
// );

module.exports = router;
