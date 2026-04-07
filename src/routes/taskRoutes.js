const express = require("express");

const taskController = require("../controllers/taskController");
const createAuthMiddleware = require("../middleware/createAuthMiddleware");
const TaskUser = require("../models/taskUserModel");

const router = express.Router();
const taskAuth = createAuthMiddleware(TaskUser, "tasks");

router.post("/auth/register", taskController.register);
router.post("/auth/login", taskController.login);
router.post("/", taskAuth, taskController.createTask);
router.get("/", taskAuth, taskController.fetchTasks);
router.patch("/:taskId", taskAuth, taskController.updateTask);
router.delete("/:taskId", taskAuth, taskController.deleteTask);

module.exports = router;
