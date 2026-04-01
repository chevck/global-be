const express = require("express");

const taskController = require("../controllers/taskController");
const createAuthMiddleware = require("../middleware/createAuthMiddleware");
const TaskUser = require("../models/taskUserModel");

const router = express.Router();
const taskAuth = createAuthMiddleware(TaskUser, "tasks");

router.post("/auth/register", taskController.register);
router.post("/auth/login", taskController.login);
router.post("/tasks", taskAuth, taskController.createTask);
router.get("/tasks", taskAuth, taskController.fetchTasks);
router.patch("/tasks/:taskId", taskAuth, taskController.updateTask);
router.delete("/tasks/:taskId", taskAuth, taskController.deleteTask);

module.exports = router;
