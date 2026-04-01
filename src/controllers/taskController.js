const TaskUser = require("../models/taskUserModel");
const Task = require("../models/taskModel");
const {
  hashPassword,
  comparePassword,
  signToken,
} = require("../utils/auth");

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const existingUser = await TaskUser.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const user = await TaskUser.create({
      email: email.toLowerCase(),
      password: await hashPassword(password),
      name,
    });

    const token = signToken({ userId: user._id, project: "tasks" });

    return res.status(201).json({
      message: "Task user registered successfully.",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await TaskUser.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken({ userId: user._id, project: "tasks" });

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      dueDate,
    });

    return res.status(201).json({
      message: "Task created successfully.",
      task,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const fetchTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({
      isCompleted: 1,
      dueDate: 1,
      createdAt: -1,
    });

    return res.json({
      message: "Tasks fetched successfully.",
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const allowedUpdates = ["title", "description", "dueDate", "isCompleted"];
    const updatePayload = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updatePayload[field] = req.body[field];
      }
    });

    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: req.user._id },
      updatePayload,
      { new: true, runValidators: true },
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.json({
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findOneAndDelete({ _id: taskId, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.json({
      message: "Task deleted successfully.",
      task,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  createTask,
  fetchTasks,
  updateTask,
  deleteTask,
};
