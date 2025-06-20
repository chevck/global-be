const express = require("express");
const examinationController = require("../controllers/examination.controller");
const { checkAuthorization } = require("../middlewares/checkAuthorization");
const router = express.Router();

router.post("/exam-login-student", examinationController.loginStudent);
router.post("/exam-create", checkAuthorization, examinationController.create);
router.get("/exams", checkAuthorization, examinationController.getAll);
router.get("/exam/:id", examinationController.getExam);
router.post(
  "/save-questions",
  checkAuthorization,
  examinationController.saveExaminationQuestions
);

module.exports = router;
