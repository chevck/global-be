require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const taskRoutes = require("./src/routes/taskRoutes");
const budgetRoutes = require("./src/routes/budgetRoutes");

const app = express();
const port = process.env.PORT || 6300;
const mongoURI = process.env.MONGOURI;

app.use(cors({ origin: "*", credentials: true }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Global backend is running.",
    projects: ["daily-tasks", "budget-tracker"],
  });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/budgets", budgetRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error.",
  });
});

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server ready on port ${port}.`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });
