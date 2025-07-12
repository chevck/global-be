const express = require("express");
const examinationController = require("../controllers/examination.controller");
const {
  checkAuthorization,
  checkStudentLoginAuthorization,
} = require("../middlewares/checkAuthorization");
const router = express.Router();

router.post("/exam-login-student", examinationController.loginStudent);
router.post("/exam-create", checkAuthorization, examinationController.create);
router.get("/exams", checkAuthorization, examinationController.getAll);
router.delete(
  "/exam/:examId",
  checkAuthorization,
  examinationController.deleteExam
);
router.put("/exams/:examId", checkAuthorization, examinationController.update);
router.get("/exam/:examId", examinationController.getExam);
router.post(
  "/save-questions",
  checkAuthorization,
  examinationController.saveExaminationQuestions
);
router.post(
  "/exam/:examId/submit",
  checkStudentLoginAuthorization,
  examinationController.submitExam
);

module.exports = router;
