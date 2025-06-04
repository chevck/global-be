const express = require("express");
const studentController = require("../controllers/student.controller");
const router = express.Router();

router.post("/student-create", studentController.create);

module.exports = router;
