const express = require("express");
const voiceTrainingController = require("../controllers/voiceTraining.controller");
const designController = require("../controllers/design.controller");
const taskController = require("../controllers/task.controller");

const router = express.Router();

router.post("/create", taskController.create);

// Voice / speech training programme (AI-generated from the learner's profile)
router.post(
  "/voice-training/create",
  voiceTrainingController.createVoiceTrainingTasks,
);

// Design training programme (AI-generated from the learner's profile)
router.post("/design/create", designController.createDesignTasks);

module.exports = router;
