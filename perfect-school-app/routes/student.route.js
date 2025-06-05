const express = require("express");
const studentController = require("../controllers/student.controller");
const router = express.Router();

router.post("/student", studentController.create);
router.get("/student", studentController.get);
router.put("/student/:id", studentController.edit);
router.delete("/student/:id", studentController.delete);

module.exports = router;
