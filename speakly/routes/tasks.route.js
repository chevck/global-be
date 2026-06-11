const express = require("express");
const taskController = require("../controllers/tasks.controller");

const router = express.Router();

router.post("/create", taskController.createSpeaklyTasks);

module.exports = router;
